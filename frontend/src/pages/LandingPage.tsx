import React from 'react';
import { Layout } from '../components/layout/Layout';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { EvaluationCriteriaSection } from '../components/landing/EvaluationCriteriaSection';
import { CtaSection } from '../components/landing/CtaSection';

export const LandingPage: React.FC = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <EvaluationCriteriaSection />
      <CtaSection />
    </Layout>
  );
};

