import React from "react";
import HeroSection from "../components/HeroSection";
import Categories from "./Categories";
import FeatureSection from "../components/FeaturedSection";

const Home = () => {
  return (
    <>
      <HeroSection />
      <Categories />
      <FeatureSection />
    </>
  );
};

export default Home