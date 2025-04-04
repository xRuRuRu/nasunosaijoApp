import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import styles from '../styles/Menu.module.css';


export default function Home() {
  const [menus, setMenus] = useState([]);
  const [activeCategory, setActiveCategory] = useState("返礼品");
  const [quantities, setQuantities] = useState({});
  const [selectedItem, setSelectedItem] = useState(null); // ← ポップアップ用
  const router = useRouter();


  const categories = [
    "返礼品", "通夜振る舞い", "昼食料理", "精進落とし", "プラン",
    "納棺師", "霊柩車", "お別れ袋", "バス", "喪主花", "その他",
  ];

  useEffect(() => {
    const fetchMenus = async () => {
      const { data, error } = await supabase.from('menus').select('*');
      if (error) {
        console.error('データ取得エラー:', error);
      } else {
        setMenus(data);
      }
    };

    const savedQuantities = localStorage.getItem('quantities');
    if (savedQuantities) {
      setQuantities(JSON.parse(savedQuantities));
    }
    fetchMenus();
  }, []);

  const openPopup = (item) => {
    setSelectedItem(item);
  };

  const closePopup = () => {
    setSelectedItem(null);
  };

  const handleQuantityChange = (menuCode, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [menuCode]: Math.max(0, (prev[menuCode] || 0) + delta),
    }));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>なすの斎場グループ　御見積り作成システム</h1>

      {/* カテゴリタブ */}
      <div className={styles.categoryTabs}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={
              activeCategory === category
                ? styles.categoryButtonActive
                : styles.categoryButton
            }
          >
            {category}
          </button>
        ))}
      </div>

      {/* 商品一覧 */}
      <ul className={styles.menuList}>
        {menus
          .filter((item) =>
            item.category?.split(',').map((c) => c.trim()).includes(activeCategory)
          )
          .map((item) => (
            <li
              key={item.menuCode}
              onClick={() => openPopup(item)}
              className={styles.menuItem}
            >
              {item.recommended === 1 && (
                <div className={styles.recommendTag}>人気</div>
              )}
              <img
                src={item.image_url}
                alt={item.name}
                className={styles.menuImage}
              />
              <div style={{ marginTop: '0.5rem' }}>
                <strong>{item.name}</strong><br />
                ¥{item.price}
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                数量：{quantities[item.menuCode] || 0}
              </div>
            </li>
          ))}
      </ul>


      {/* モーダル */}
      {selectedItem && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <img
              src={selectedItem.image_url}
              alt={selectedItem.name}
              style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
            />
            <h2 style={{ margin: '1rem 0 0.5rem' }}>{selectedItem.name}</h2>
            <p>(税込)　¥{selectedItem.price}</p>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1rem',
              margin: '1rem 0'
            }}>
              <input type="number"
                min="0"
                value={quantities[selectedItem.menuCode] || 0}
                onChange={(e) => {
                  const value = Math.max(0, parseInt(e.target.value) || 0);
                  setQuantities((prev) => ({
                    ...prev,
                    [selectedItem.menuCode]: value,
                  }));
                }}
                className={styles.quantityInput}
              /><p>個</p>
            </div>

            <button onClick={closePopup} className={styles.modalCloseButton}>決定</button>
          </div>
        </div>
      )}

      {/* 「次へ」ボタン（モーダル外） */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={() => {
            // 数量が1以上の商品のみ抽出
            const selectedItems = menus
              .filter((item) => (quantities[item.menuCode] || 0) > 0)
              .map((item) => ({
                menuCode: item.menuCode,
                name: item.name,
                price: item.price,
                quantity: quantities[item.menuCode],
              }));

            localStorage.setItem('estimateData', JSON.stringify(selectedItems));
            localStorage.setItem('quantities', JSON.stringify(quantities));
            router.push('/estimate');
          }}
          className={styles.nextButton}
        >
          集計へ進む
        </button>
      </div>

    </div>
  );
}
