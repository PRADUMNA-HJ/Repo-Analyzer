from app.analysis.analyzers.python_analyzer import PythonSourceAnalyzer
from app.analysis.analyzers.javascript_analyzer import JavaScriptSourceAnalyzer
from app.analysis.analyzers.generic_analyzer import GenericSourceAnalyzer


def test_python_ast_analyzer_metrics_and_security():
    analyzer = PythonSourceAnalyzer()
    assert analyzer.can_analyze("app/main.py") is True
    assert analyzer.can_analyze("app/index.js") is False

    code = """
import os
import subprocess

def calculate_discount(price: float, rate: float) -> float:
    try:
        if rate > 1.0:
            return price
        elif rate < 0:
            return 0.0
        return price * (1.0 - rate)
    except Exception:
        return price

class OrderProcessor:
    def process(self):
        eval("2 + 2")
        subprocess.run("ls", shell=True)
        api_key = "super_secret_production_key_12345"
"""
    result = analyzer.analyze("app/services.py", code)

    assert result.language == "Python"
    assert result.function_count >= 2
    assert result.class_count == 1
    assert result.has_error_handling is True
    assert result.has_type_annotations is True

    # Security findings: eval, shell=True, hardcoded secret
    sec_categories = [s.category for s in result.security_findings]
    assert "dangerous_execution" in sec_categories
    assert "shell_injection_risk" in sec_categories
    assert "hardcoded_secret" in sec_categories

    # Verify secret redaction
    for s in result.security_findings:
        if s.category == "hardcoded_secret":
            assert "[REDACTED_SECRET]" in s.evidence_snippet
            assert "super_secret_production_key_12345" not in s.evidence_snippet


def test_javascript_analyzer_security_and_metrics():
    analyzer = JavaScriptSourceAnalyzer()
    assert analyzer.can_analyze("src/App.tsx") is True

    code = """
import React from 'react';

interface UserProps {
    name: string;
    role: string;
}

export const UserCard: React.FC<UserProps> = ({ name, role }) => {
    const access_token = "secret_jwt_bearer_token_987654321";
    return (
        <div dangerouslySetInnerHTML={{ __html: name }}>
            <span>{role}</span>
        </div>
    );
};
"""
    result = analyzer.analyze("src/components/UserCard.tsx", code)

    assert result.language == "TypeScript"
    assert result.has_type_annotations is True
    sec_cats = [s.category for s in result.security_findings]
    assert "hardcoded_secret" in sec_cats
    assert "xss_risk" in sec_cats

    for s in result.security_findings:
        if s.category == "hardcoded_secret":
            assert "[REDACTED_SECRET]" in s.evidence_snippet
            assert "secret_jwt_bearer_token_987654321" not in s.evidence_snippet


def test_generic_analyzer_java():
    analyzer = GenericSourceAnalyzer()
    assert analyzer.can_analyze("src/main/java/App.java") is True

    code = """
package com.example;

public class App {
    public static void main(String[] args) {
        try {
            System.out.println("Hello");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
"""
    result = analyzer.analyze("App.java", code)
    assert result.language == "Java"
    assert result.has_error_handling is True
    assert result.has_type_annotations is True

