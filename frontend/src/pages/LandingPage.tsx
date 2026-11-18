import React from 'react';
import { Layout } from '../components/layout/Layout';
import { HeroSection } from '../components/landing/HeroSection';
import { PlatformStats } from '../components/landing/PlatformStats';
import { ProblemVsSolution } from '../components/landing/ProblemVsSolution';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { EvaluationCriteriaSection } from '../components/landing/EvaluationCriteriaSection';
import { CtaSection } from '../components/landing/CtaSection';

export const LandingPage: React.FC = () => {
  return (
    <Layout>
      <HeroSection />
      <PlatformStats />
      <ProblemVsSolution />
      <FeaturesSection />
      <HowItWorksSection />
      <EvaluationCriteriaSection />
      <CtaSection />
    </Layout>
  );
};
