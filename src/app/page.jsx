import Navbar from "@/components/navbar/Navbar";
import styles from "./homepage.module.css";
import Link from "next/link";
import Footer from "@/components/footer/Footer";
import Feature from "@/components/featured/Featured";
import CategoryList from "@/components/categoryList/CategoryList";

export default function Home() {
  return (
    <div>
      <Feature/>
      <CategoryList/>
    </div>
  );
}