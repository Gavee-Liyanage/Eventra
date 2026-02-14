import React from "react";
import HeroSection from "../components/HeroSection";
import Categories from "./Categories";
import FeatureSection from "../components/FeaturedSection";
import ActionSection from "../components/ActionSection";
import GuideSection from "../components/GuideSection";

const Home = () => {
  return (
    <>
      <HeroSection />
      <Categories />
      <FeatureSection />
      <ActionSection/>
      <GuideSection/>
    </>
  );
};

export default Home