/* global mixpanel */
import React, { useContext, useEffect, useState } from 'react';
import CameraTag from '@/components/CameraTag';
import { useInterview } from '../services/apiHooks';

import ReactPlayer from 'react-player';

import { storeInterviewQuestionRework } from '@/services/api';
import { InfoOutlined } from '@ant-design/icons';
import { Typography, Row, Col, List, Button, Drawer } from 'antd';
import auth_main_img from '../assets/img/video_left.png';
import styles from './index.less';
import arrow from '../assets/img/arrow.svg';
import { router } from 'umi';

import { lowerCaseQueryParams } from '@/services/helpers';

import HandleBrowsers from '@/components/HandleBrowsers';
import { CompleteInterviewDataContext } from '@/layouts';
const { Title, Paragraph } = Typography;

const mockData = [
  'Focus on your most recent job title and experience.',
  'Talk about your most impressive accomplishments.',
  'Include one or two sentences about what type of organization you are looking for.',
];

function replaceUrlParam(url, paramName, paramValue) {
  if (paramValue == null) {
    paramValue = '';
  }
  var pattern = new RegExp('\\b(' + paramName + '=).*?(&|#|$)');
  if (url.search(pattern) >= 0) {
    return url.replace(pattern, '$1' + paramValue + '$2');
  }
  url = url.replace(/[?#]$/, '');
  return url + (url.indexOf('?') > 0 ? '&' : '?') + paramName + '=' + paramValue;
}

const addQuestionIndexQueryParam = index => {
  const myNewURL = replaceUrlParam(window.location.href, 'question', index + 1);
  window.history.pushState({}, document.title, myNewURL);
};

const TipDrawer = ({ drawerVisible, setDrawerVisible, questionInfo, tips, exampleVideos }) => (
  <Drawer
    width={350}
    title="Tips & Examples"
    placement="right"
    closable={true}
    onClose={() => setDrawerVisible(false)}
    visible={drawerVisible}
  >
    <Paragraph type="secondary">
      {questionInfo || 'These videos are a chance to show off what makes you unique.'}
    </Paragraph>
    <List
      dataSource={tips || mockData}
      renderItem={(item, i) => (
        <div>
          <Typography.Text>{i + 1}.</Typography.Text> {item}
        </div>
      )}
    />

    {exampleVideos && (
      <List
        dataSource={exampleVideos}
        renderItem={(item, i) => (
          <ReactPlayer style={{ marginTop: 24 }} url={item} width={300} height={169} />
        )}
      />
    )}
  </Drawer>
);
const Record = ({ location }) => {
  const { data: interviewData } = useInterview();

  const { id, fullname: fullName, email, question: questionIndex } = lowerCaseQueryParams(
    location.search
  );
  const startingQuestionIndex = parseInt(questionIndex) - 1;

  const [index, setIndex] = useState(startingQuestionIndex ? startingQuestionIndex : 0);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const completeInterviewData = useContext(CompleteInterviewDataContext);
  const data = completeInterviewData?.interviewData;
  const companyId = completeInterviewData?.companyData?._id;

  let mobile = false;
  const width = () =>
    window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

  if (width() < 576) mobile = true;

  const completedQ = (medias, uuid) => {
    setIndex(index => {
      const interviewData = {
        interviewId: id,
        userId: email,
        userName: fullName,
        candidateEmail: email,
        interviewName: data.interviewName,
        question: data.interviewQuestions[index].question,
        medias,
        uuid,
      };

      if (index + 1 === interviewQuestions.length) {
        storeInterviewQuestionRework(
          interviewData,
          data.createdBy,
          companyId,
          completeInterviewData,
          true
        );
        mixpanel.people.set({
          interviewStage: 'completed',
        });
        mixpanel.track('Interview completed');
        router.push(`/victory${location.search}`);
        return index;
      } else {
        storeInterviewQuestionRework(
          interviewData,
          data.createdBy,
          companyId,
          completeInterviewData
        );
        addQuestionIndexQueryParam(index + 1);
        return index + 1;
      }
    });
  };
  if (!data) return null;

  const { interviewQuestions, interviewConfig, createdBy } = data;
  //  {tips, hint, questionInfo, exampleVideos} = interviewQuestions
  const currentQuestion = interviewQuestions[index];
  const { question, hint, questionInfo, tips, exampleVideos, answerTime } = currentQuestion;
  const customdata = e => {
    console.log(currentQuestion);
  };

  return (
    <div className={styles.Login}>
      <div className={styles.Login_left_area}>
        <div className={styles.left_area_camera}>
          <div>
            <h1 className={styles.left_area_camera_main_heading} onClick={customdata}>
              BUILDING MANAGER BY RPH GLOBAL SDN BHD
            </h1>
            <p className={styles.left_area_camera_main_Para}>
              You have to answer 5 video recorded questions and 0 quiz to complete this interview
            </p>
          </div>

          <div className={styles.StepWrapper}>
            {interviewQuestions.map((EachQuestion, key) => (
              <div className={`${styles.Step} `}>
                <div
                  className={`${styles.ball} ${EachQuestion.question ==
                    currentQuestion['question'] && styles.activeBall}`}
                >
                  <p>{key + 1}</p>
                </div>
                <span
                  className={`${styles.stepspan} ${EachQuestion.question ==
                    currentQuestion['question'] && styles.activeSpan}`}
                >
                  Type : Video Answer{' '}
                </span>
                <h1
                  className={`${styles.StepHeading} ${EachQuestion.question ==
                    currentQuestion['question'] && styles.activeHeading}`}
                >
                  {EachQuestion.question}
                </h1>
                <p
                  className={`${styles.StepPara}${EachQuestion.question ==
                    currentQuestion['question'] && styles.activePara}`}
                >
                  15 minutes to think , 15 seconds to record
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* className="right_area form_area_canditate form_area_video" */}
      <div className={`${styles.Login_right_area} ${styles.form_area_canditate}`}>
        <div className={styles.form_area_canditate_form_area}>
          {/* <p>Questions 2 / 5</p>
         
          <p>This question is timed ! You have 15 seconds & unlimited Retakes.</p> */}

          <HandleBrowsers>
            <div className={styles.wrapper}>
              <TipDrawer
                questionInfo={questionInfo}
                tips={tips}
                exampleVideos={exampleVideos}
                setDrawerVisible={setDrawerVisible}
                drawerVisible={drawerVisible}
              />
              {/* <h3 key={index} style={{ textAlign: 'center' }}>{`Question ${index + 1}/${
        interviewQuestions.length
      }`}</h3> */}
              <Row type="flex" justify="center">
                <Col lg={12} sm={20} xs={24}>
                  <p
                    className={`${styles.Login_right_area_form_main_p} ${styles.Login_right_area_form_main_p_no_margin} ${styles._center_recording}`}
                  >{`Question ${index + 1}/${interviewQuestions.length}`}</p>
                  <h1
                    className={`${styles.Login_right_area_form_main_heading} ${styles._center_recording}`}
                  >
                    {question}
                  </h1>

                  {/* <Button
                      onClick={() => setDrawerVisible(true)}
                      shape="circle"
                      icon={<InfoOutlined />}
                      style={{ marginLeft: 8 }}
                    /> */}

                  {hint && (
                    <Title level={4} type="secondary" style={{ marginTop: 0 }}>
                      {hint}
                    </Title>
                  )}
                </Col>
              </Row>
              <CameraTag
                mobile={mobile}
                name={`${createdBy} ${fullName} ${data.interviewName}`}
                description={`${JSON.stringify(currentQuestion)} ${email} ${id} ${index} ${
                  data.createdBy
                }`}
                onUpload={completedQ}
                maxLength={answerTime || interviewConfig.answerTime}
              />
              <div
                className={`${styles.Login_right_area_button_wrapper} ${styles.Login_right_area_button_wrapper_mbl}`}
              >
                <button
                  className={`${styles.Login_right_area_buttom_wrapper_button} ${styles.Login_right_area_buttom_wrapper_button_job_details}   ${styles.no_padding_button}`}
                >
                  <a
                    href="https://jurbly.com/get-help"
                    target="_blank"
                    className={`${styles.Login_right_area_buttom_wrapper_button} ${styles.Login_right_area_buttom_wrapper_button_job_details}`}
                  >
                    Get Help
                    <img src={arrow} alt="" />
                  </a>
                </button>
                <button
                  onClick={() => setDrawerVisible(true)}
                  className={`${styles.Login_right_area_buttom_wrapper_button}`}
                >
                  Notes
                  <img src={arrow} alt="" />
                </button>
              </div>
              {/* <Row type="flex" justify="center" style={{ textAlign: 'center' }}>
                <Paragraph style={{ fontSize: mobile ? '1.25em' : '1.75em', marginBottom: 0 }}>
                  {' '}
                  This question is timed! You have {answerTime || interviewConfig.answerTime}{' '}
                  seconds {interviewData?.disableRetakes ? '' : 'and unlimited retakes'}.
                </Paragraph>
              </Row> */}
            </div>
          </HandleBrowsers>
        </div>

        <div
          className={`${styles.form_area_canditate_notes} ${styles.form_area_canditate_notes_width}`}
        >
          <p
            className={`${styles.form_area_canditate_notes_p} ${styles.form_area_canditate_notes_p_center}`}
          >
            www.jurbly.com
          </p>
        </div>
      </div>
    </div>
  );
};
export default Record;
