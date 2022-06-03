import React, { useState } from 'react';
import styles from './index.less';
const InputCustom = ({ icon, label, type }) => {
  const [value, setvalue] = useState('');
  return (
    <div className={styles.Input}>
      <div className={`${styles.input_container} `}>
        <label htmlFor="" className={`${styles.label} ${value.length > 0 && styles.active_label}`}>
          {label}
        </label>
        <div
          className={`${styles.input_wrapper} ${value.length > 0 && styles.input_wrapper_active}`}
        >
          <img src={icon} alt="" />
          <input
            type={type}
            value={value}
            className={styles.input}
            onChange={e => {
              setvalue(e.target.value);
            }}
          />
        </div>
      </div>
    </div>
  );
};
export default InputCustom;
