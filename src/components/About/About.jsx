import React from "react";

import styles from "./About.module.css";
import { getImageUrl } from "../../utils";

export const About = () => {
  return (
    <section className={styles.container} id="about">
      <h2 className={styles.title}>À propos</h2>
      <div className={styles.content}>
        <img
          src={getImageUrl("about/aboutImage.png")}
          alt="Me sitting with a laptop"
          className={styles.aboutImage}
        />
        <ul className={styles.aboutItems}>
          <li className={styles.aboutItem}>
            <img src={getImageUrl("about/cursorIcon.png")} alt="Cursor icon" />
            <div className={styles.aboutItemText}>
              <h3>Développeur Front-end</h3>
              <p>
                J'ai développé de nombreuses applications web et sites web, tant pour des projets persos que dans le cadre professionnel
              </p>
            </div>
          </li>
          <li className={styles.aboutItem}>
            <img src={getImageUrl("about/serverIcon.png")} alt="Server icon" />
            <div className={styles.aboutItemText}>
              <h3>Développeur Back-end</h3>
              <p>
                Je suis particulièrement à l'aise avec Spring Boot pour créer des APIs REST
              </p>
            </div>
          </li>
          <li className={styles.aboutItem}>
            <img src={getImageUrl("about/cursorIcon.png")} alt="UI icon" />
            <div className={styles.aboutItemText}>
              <h3>Développeur Data</h3>
              <p>
                Parmis les projets que j'ai réalisé, j'ai travaillé sur des projets ayant recours à différentes bases de données, tant SQL (PostgreSQL, MariaDB..) que NoSQL (MongoDB, Elasticsearch..)
              </p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
};
