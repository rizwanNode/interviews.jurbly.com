/* global mixpanel FS $crisp*/
import SignIn from '@/components/SignIn';
import { Col, Row, Divider } from 'antd';
import React, { useEffect, useContext } from 'react';
import { lowerCaseQueryParams } from '@/services/helpers';
import { startedEvent, clickedEvent } from '@/services/api';
import { CompleteInterviewDataContext } from '@/layouts';

import undrawPhoto from '@/../public/undrawPhoto.png';

import styles from './index.less';

import { Link } from 'react-router-dom';
import auth_main_img from '../assets/img/candidate.png';
import facebook from '../assets/img/faecbook.svg';
import instagram from '../assets/img/instagram.svg';
import twitter from '../assets/img/twitter.svg';
import arrow from '../assets/img/arrow.svg';

import phone from '../assets/img/phone.svg';
import email from '../assets/img/email.svg';

const dotJobsCompanyId = '5d35e2acfc5e3205581b573d';

const thingsToKnow = (
  <>
    {' '}
    <br />
    <div style={{ fontWeight: 'bold' }}>Things to know:</div>
    <div>- Your initial video interview will consist of 5 questions</div>
    <div>- These questions represent what would be asked on a first interview</div>
    <div>- You have the ability to re-record answers if you make a mistake </div>
    <div>- You MUST complete all questions for your interview to be uploaded</div>
    <div>
      - Your answers will not be saved if you leave the interview before answering all questions{' '}
    </div>
  </>
);

const proTips = (
  <>
    <br />
    <div style={{ fontWeight: 'bold' }}>Pro-tips:</div>
    <div>- Dress appropriately. Dress the way you would for an in person interview</div>
    <div>- Remove clutter from the background</div>
    <div>- Answer questions completely and honestly</div>
    <div>- Be confident. You are going to do great</div>
    <br />
    After your interview is complete you will have the ability to watch your interview responses and
    manage your recordings.
    <br />
  </>
);

const identify = (email, fullName, id) => {
  mixpanel.alias(email);
  mixpanel.people.set({
    $email: email,
    $last_login: new Date(),
    $name: fullName,
    id,
    interviewStage: 'visited',
  });
  FS.identify(email, {
    displayName: fullName,
    email,
  });
  $crisp.push(['set', 'user:email', email]);
  $crisp.push(['set', 'user:nickname', [fullName]]);
};

const Index = ({ location }) => {
  const completeInterviewData = useContext(CompleteInterviewDataContext);
  const companyId = completeInterviewData?.companyData?._id;
  const interviewName = completeInterviewData.interviewData?.interviewName;
  const { id, fullname: fullNameParam, email: emailParam, simple } = lowerCaseQueryParams(
    location.search
  );

  const executeStartedEvent = async (candidateEmail = emailParam, userName = fullNameParam) => {
    return await startedEvent(
      candidateEmail,
      userName,
      companyId,
      interviewName,
      completeInterviewData
    );
  };
  const executeClickedEvent = (candidateEmail, userName) => {
    return clickedEvent(candidateEmail, userName, companyId, interviewName, completeInterviewData);
  };

  const useOnMount = () =>
    useEffect(() => {
      if (emailParam && fullNameParam && id) {
        executeClickedEvent(emailParam, fullNameParam);
        identify(emailParam, fullNameParam, id);
      }
    }, []);

  useOnMount();

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
          <h1 className={styles.Login_right_area_form_main_heading}>Welcome </h1>
          <p className={styles.Login_right_area_form_main_p}>
            You have been invited to attend a virtual interview for
            <Link to="/" className={styles.form_area_canditate_a}>
              Building Manager Position
            </Link>
            By
            <Link to="/" className={styles.form_area_canditate_a}>
              RPH GLOBAL SDN BHD
            </Link>
          </p>

          <form>
            <SignIn
              executeStartedEvent={executeStartedEvent}
              companyId={companyId}
              location={location}
              skip={fullNameParam && emailParam}
            />
            {/* <div className="button_wrapper">
              <button className="job_details">
                Job Detail
                <img src={arrow} alt="" />
              </button>
              <button onClick={e => setActive(2)}>
                Start now
                <img src={arrow} alt="" />
              </button>
            </div> */}
          </form>
        </div>

        <div className={styles.form_area_canditate_notes}>
          <h1 className={styles.form_area_canditate_notes_h1}>Important Note :</h1>
          <p className={styles.form_area_canditate_notes_p}>
            You will be asked to record answers to a series of prompts that will ask you common
            interview questions. You will need :
          </p>
          <ul className={styles.form_area_canditate_notes_ul}>
            <li className={styles.form_area_canditate_notes_li}>
              Your phone or a computer with a camera
            </li>
            <li className={styles.form_area_canditate_notes_li}>Quiet environment</li>
            <li className={styles.form_area_canditate_notes_li}>10-15 minutes</li>
          </ul>
        </div>
      </div>
    </div>
    // <div className={styles.normal}>
    //   <SignIn
    //     executeStartedEvent={executeStartedEvent}
    //     companyId={companyId}
    //     location={location}
    //     skip={fullNameParam && emailParam}
    //   />
    // </div>
  );
};

export default Index;
