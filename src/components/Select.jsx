import React, { useState } from 'react';

import styles from './index.less';
import arrow_dropdown from '../assets/img/arrow_dropdown.svg';
const Select = ({ icon, label, list }) => {
  const [value, setvalue] = useState('');
  return (
    <div className={styles.Input}>
      <div className={`${styles.input_container}`}>
        <div
          className={`${styles.input_wrapper} ${value.length > 0 && styles.input_wrapper_active}`}
        >
          <img src={icon} alt="" />
          <select
            onChange={e => {
              setvalue(e.target.value);
            }}
            className={styles.select}
          >
            <option disabled selected>
              {label}
            </option>
            {list.map(EachOption => (
              <option value={EachOption}>{EachOption}</option>
            ))}
          </select>

          <img src={arrow_dropdown} alt="" />
        </div>
      </div>
    </div>
  );
};
export default Select;
