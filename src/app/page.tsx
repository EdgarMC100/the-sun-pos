import Image from "next/image";
import styles from "./home.module.css";
import Marquee from "react-fast-marquee";
import BrandTitle from "@/components/BrandTitle";


const footerLabel = "Under construction. Coming soon.";
export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <BrandTitle>Papeleria el</BrandTitle>
        <Image className={styles.logo} src="/elsollogo.png" alt="Next.js logo" width={350} height={350} />
      </div>
      <div className={styles.content}>
        <Image className={styles.imageInDev} src="/under_construction.webp" alt="Next.js logo" width={500} height={500} />
      </div>
      <div className={styles.footer}>
         <Marquee>
            {
              Array(20).fill(footerLabel).map((label, index) => {
                if(index % 2 === 0) return <span key={index}>&emsp;&emsp;&emsp;</span>
                return (
                  <span key={index} className={styles.footerText}>{label}</span>
                )
            })
            }
          </Marquee>
      </div>
    </div>
  );
}
