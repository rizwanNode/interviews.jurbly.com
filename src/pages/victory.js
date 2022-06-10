import { Button, Row, Rate, Form, Switch, Input, Typography } from 'antd';
import React, { useState, useContext, useEffect } from 'react';
import styles from './index.less';
import { submitFeedback } from '@/services/api';
import { CompleteInterviewDataContext } from '@/layouts';
import auth_main_img from '../assets/img/candidate.png';
import arrow from '../assets/img/arrow.svg';
import { Link } from 'react-router-dom';

import facebook from '../assets/img/faecbook.svg';
import instagram from '../assets/img/instagram.svg';
import twitter from '../assets/img/twitter.svg';
import star from '../assets/img/star.svg';
import phone from '../assets/img/phone.svg';
import email from '../assets/img/email.svg';
import InputCustom from '../components/InputCustom';
import Select from '../components/Select';
import axios from 'axios';
export default () => {
  const [finished, setFinished] = useState(false);

  const completeInterviewData = useContext(CompleteInterviewDataContext);
  const interviewId = completeInterviewData?.interviewData?._id;
  const companyId = completeInterviewData?.companyData?._id;
  const [InterviewName, setInterviewName] = useState('');
  const [CompanyName, setCompanyName] = useState('');
  const layout = {
    labelCol: { span: 10 },
    wrapperCol: { span: 6 },
  };

  const onFinish = values => {
    setFinished(true);
    submitFeedback(interviewId, companyId, values);
  };

  if (finished) return <Success />;

  return (
    <div className={styles.Login}>
      <div className={styles.Login_left_area}>
        <img src={auth_main_img} alt="" className={styles.main_login_img} />
        <div className={styles.Login_left_area_buttom_wrapper}>
          <ul className={styles.Login_left_area_buttom_wrapper_ul}>
            <li className={styles.Login_left_area_buttom_wrapper_list}>
              <Link to="/">
                <img src={facebook} alt="" />
              </Link>
            </li>
            <li className={styles.Login_left_area_buttom_wrapper_list}>
              <Link to="/">
                <img src={instagram} alt="" />
              </Link>
            </li>
            <li className={styles.Login_left_area_buttom_wrapper_list}>
              <Link to="/">
                <img src={twitter} alt="" />
              </Link>
            </li>
          </ul>
          <p>Developed by mrbotbot.com</p>
        </div>
      </div>
      {/* className="right_area form_area_canditate form_area_video" */}
      <div
        className={`${styles.Login_right_area} ${styles.form_area_canditate} ${styles.Login_form_area_video}`}
      >
        {/* <p>Questions 2 / 5</p>
       
        <p>This question is timed ! You have 15 seconds & unlimited Retakes.</p> */}

        <div className={styles.wrapper}>
          <div style={{ marginBottom: 48 }}>
            <h1 className={styles.Login_right_area_form_main_heading}>One Last Step </h1>
            <p
              className={`${styles.Login_right_area_form_main_p} ${styles.Login_right_area_form_main_p_no_margin}`}
            >
              Tell us what you think about the interview , all feedbacks are anonymous .
            </p>
          </div>
          <Form
            initialValues={{ anotherInterview: true, issues: false }}
            onFinish={onFinish}
            {...layout}
          >
            <Select
              icon={email}
              label="Do you face any issue with the application ?"
              list={['Yes', 'No']}
            />

            <Select
              icon={star}
              label="Give us a rating"
              list={['1 star', '2 star', '3 star', '4 star', '5 star']}
            />

            <InputCustom icon={phone} label="Any Comment ?" type="text" />

            {/* <Form.Item label="How would you rate the video introduction software?" name="rating">
              <Rate />
            </Form.Item>
            <Form.Item
              valuePropName="checked"
              name="issues"
              label="Did you have any software issues?"
            >
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
            <Form.Item name="ratingReason" label="Why did you give the rating above?">
              <Input.TextArea />
            </Form.Item> */}

            <Form.Item wrapperCol={{ xs: { span: 24, offset: 0 } }}>
              <div className={styles.button_wrapper_last_step}>
                <Button
                  type="primary"
                  htmlType="submit"
                  className={styles.Login_right_area_buttom_wrapper_button}
                >
                  Complete
                  <img src={arrow} />
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>

        <div className={styles.form_area_canditate_notes}>
          <h1 className={styles.form_area_canditate_notes_h1}> Need Help ?</h1>
          <p className={`${styles.form_area_canditate_notes_p}`}>
            If you have issue with your interview and you would like us to help you reset the
            session, please sent us a support ticket here.
          </p>
          <p></p>
        </div>
      </div>
    </div>
  );
};

const Success = () => {
  const [InterviewName, setInterviewName] = useState('');
  const [CompanyName, setCompanyName] = useState('');
  const completeInterviewData = useContext(CompleteInterviewDataContext);
  const interviewId = completeInterviewData?.interviewData?._id;
  const companyId = completeInterviewData?.companyData?._id;

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const { id } = Object.fromEntries(urlSearchParams.entries());

    axios.get(`https://a.jurbly.com/v1/interviews/${id}`).then(res => {
      setInterviewName(res.data[0]['interviewName']);
    });
  }, []);

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const { id } = Object.fromEntries(urlSearchParams.entries());

    axios.get(`https://a.jurbly.com/v1/companies/${companyId}`).then(res => {
      setCompanyName(res['data']['companyName']);
    });
  }, [companyId]);

  return (
    <div className={styles.Login}>
      <div className={styles.Login_left_area}>
        <img src={auth_main_img} alt="" className={styles.main_login_img} />
        <div className={styles.Login_left_area_buttom_wrapper}>
          <ul className={styles.Login_left_area_buttom_wrapper_ul}>
            <li className={styles.Login_left_area_buttom_wrapper_list}>
              <Link to="/">
                <img src={facebook} alt="" />
              </Link>
            </li>
            <li className={styles.Login_left_area_buttom_wrapper_list}>
              <Link to="/">
                <img src={instagram} alt="" />
              </Link>
            </li>
            <li className={styles.Login_left_area_buttom_wrapper_list}>
              <Link to="/">
                <img src={twitter} alt="" />
              </Link>
            </li>
          </ul>
          <p>Developed by mrbotbot.com</p>
        </div>
      </div>
      <div className={`${styles.Login_right_area} ${styles.form_area_canditate}`}>
        <div className={styles.form_area_canditate_form_area}>
          <h1 className={styles.Login_right_area_form_main_heading}>ALL DONE ! </h1>
          <p className={styles.Login_right_area_form_main_p}>
            Thank you for attending the virtual interview for
            <Link to="/" className={styles.Login_right_area_form_main_l}>
              {InterviewName}
            </Link>{' '}
            By
            <Link to="/" className={styles.Login_right_area_form_main_l}>
              {CompanyName}
            </Link>
            . We’ll be watching your interview soon and will contact you about the nextsteps .
          </p>

          <form className={styles.view_Jurbly_form}>
            <div className={styles.Login_right_area_button_wrapper}>
              <button
                style={{ width: 250 }}
                className={styles.Login_right_area_buttom_wrapper_button}
              >
                Visit Jurbly
                <img src={arrow} alt="" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
