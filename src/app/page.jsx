import styles from "./homepage.module.css";
import Feature from "@/components/featured/Featured";
import CardList from "@/components/cardList/CardList";
import Menu from "@/components/menu/Menu";

export default function Home({ searchParams }) {
  const page = parseInt(searchParams.page) || 1

  return (
    <div className={styles.container}>
      <Feature/>
      <div id="recent-posts" className={styles.content}>
        <CardList page={page} cat="" />
        <Menu/>
      </div>
    </div>
  );
}