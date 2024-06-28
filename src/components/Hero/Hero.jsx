import React from "react";

import styles from "./Hero.module.css";
import { getImageUrl } from "../../utils";

export const Hero = () => {
  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Hello, moi c'est Etienne</h1>
        <p className={styles.description}>
          Je suis alternant ingénieur en informatique avec une spécalité en développement logiciel.
          Déroulez pour en savoir plus !
        </p>
        <a href="mailto:etiennechevrollier@gmail.com" className={styles.contactBtn}>
          Contactez-moi
        </a>
      </div>
      <img
        src={getImageUrl("hero/heroImage.jpg")}
        alt="Hero image of me"
        className={styles.heroImg}
      />
      <div className={styles.topBlur} />
      <div className={styles.bottomBlur} />
    </section>
  );
};
