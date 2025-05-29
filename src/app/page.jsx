import styles from "./homepage.module.css";
import Feature from "@/components/featured/Featured";
import CardList from "@/components/cardList/CardList";
import Menu from "@/components/menu/Menu";

export default function Home() {
  return (
    <div className={styles.main}>
      <Feature/>
      <div id="recent-posts" className={styles.content}>
        <CardList cat="" />
        <Menu/>
      </div>
    </div>
  );
}