// pages/index.js
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [menus, setMenus] = useState([]);

  useEffect(() => {
    const fetchMenus = async () => {
      const { data, error } = await supabase.from('menus').select('*');
      if (error) {
        console.error('データ取得エラー:', error);
      } else {
        setMenus(data);
      }
    };

    fetchMenus();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>メニュー一覧</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {menus.map((item) => (
          <li key={item.menuCode} style={{ marginBottom: '2rem' }}>
            <img
              src={item.image_url}
              alt={item.name}
              style={{ width: '200px', height: 'auto', borderRadius: '8px' }}
            />
            <div style={{ marginTop: '0.5rem' }}>
              <strong>{item.name}</strong> - ¥{item.price}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
