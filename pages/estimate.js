// pages/estimate.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Estimate.module.css';

export default function EstimatePage() {
  const [groupedItems, setGroupedItems] = useState({});
  const [total, setTotal] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('estimateData');
    if (stored) {
      const items = JSON.parse(stored);

      const grouped = {};
      let overallTotal = 0;

      items.forEach((item) => {
        const category = item.category || '未分類';
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(item);
        overallTotal += item.price * item.quantity;
      });

      setGroupedItems(grouped);
      setTotal(overallTotal);
    }
  }, []);

  return (
    <div className={styles.container}>
      <h1>見積確認</h1>

      {Object.keys(groupedItems).length === 0 ? (
        <p>見積に選ばれた商品はありません。</p>
      ) : (
        Object.entries(groupedItems).map(([category, items]) => {
          const subtotal = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          return (
            <div key={category} className={styles.section}>
              <div className={styles.sectionTitle}>■ {category}</div>
              <ul>
                {items.map((item) => (
                  <li key={item.menuCode} className={styles.item}>
                    {item.name} × {item.quantity}個　¥{item.price.toLocaleString()} × {item.quantity} = ¥{(item.price * item.quantity).toLocaleString()}
                  </li>
                ))}
              </ul>
              <div>小計：¥{subtotal.toLocaleString()}</div>
            </div>
          );
        })
      )}

      <div className={styles.totalRow}>総額：¥{total.toLocaleString()}</div>

      <button onClick={() => router.push('/')} className={styles.backButton}>
        戻る
      </button>
    </div>
  );
}