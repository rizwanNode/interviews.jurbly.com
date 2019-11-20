/* global mixpanel $crisp */
import React, { useEffect, useState } from 'react';
import CameraTag from '@/components/CameraTag';

import ReactPlayer from 'react-player'

import { fetchInterview, storeInterviewQuestionRework } from '@/services/api';
import { Typography, Row, Col, Icon, List, Button, Drawer } from 'antd';

import styles from './index.less';

import { router } from 'umi';

import qs from 'qs';

import HandleBrowsers from '@/components/HandleBrowsers';
const { Title, Paragraph } = Typography;

const mockData = [
  'Focus on your most recent job title and experience.',
  'Talk about your most impressive accomplishments.',
  'Include one or two sentences about what type of organization you are looking for.',
];

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
      {questionInfo || "These videos are a chance to show off what makes you unique."}
    </Paragraph>
    <List
      dataSource={tips || mockData}
      renderItem={(item, i) => (
        <div>
          <Typography.Text>{i + 1}.</Typography.Text> {item}
        </div>
      )}
    />

    {exampleVideos && <List
      dataSource={exampleVideos}
      renderItem={(item, i) => (
          <ReactPlayer style={{marginTop: 24}} url={item} width={300} height={169}  />
       
      )}
    />
      }
  </Drawer>
);
const Record = ({ location }) => {
  const id = qs.parse(location.search)['?id'];
  const fullName = qs.parse(location.search)['fullName'];
  const email = qs.parse(location.search)['email'];
  const simple = qs.parse(location.search)['simple'];
  const chatbox = qs.parse(location.search)['chat'];

  if (chatbox === '0') $crisp.push(["do", "chat:hide"])


  const [index, setIndex] = useState(0);
  const [data, setData] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    const setup = async () => {
      var [data] = await fetchInterview(id);
      setData(data);
    };

    setup();
  }, [id]);

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
        storeInterviewQuestionRework(interviewData, data.createdBy);
        mixpanel.people.set({
          interviewStage: 'completed',
        });
        mixpanel.track('Interview completed');
        router.push(`/victory?id=${id}${simple === '1' ? '&simple=' + simple : ''}${chatbox === '0' ? '&chat=' + chatbox : ''}`);
        return index;
      } else {
        storeInterviewQuestionRework(interviewData);
        return index + 1;
      }
    });
  };
  if (!data) return null;

  const { interviewQuestions, interviewConfig } = data;
  //  {tips, hint, questionInfo, exampleVideos} = interviewQuestions
  const currentQuestion = interviewQuestions[index]
  const {question, hint, questionInfo, tips, exampleVideos, answerTime} = currentQuestion
  return (
    <HandleBrowsers>
      <div className={styles.wrapper}>
        <TipDrawer questionInfo={questionInfo} tips={tips} exampleVideos={exampleVideos}  setDrawerVisible={setDrawerVisible} drawerVisible={drawerVisible} />
        {/* <h3 key={index} style={{ textAlign: 'center' }}>{`Question ${index + 1}/${
        interviewQuestions.length
      }`}</h3> */}
        <Row type="flex" justify="center">
          <Col style={{ textAlign: 'center' }} lg={12} sm={20} xs={24}>
            <Title level={2} style={{ marginBottom: 8 }}>
              {question}
              <Button
                onClick={() => setDrawerVisible(true)}
           
                shape="circle"
                icon="info"
                style={{marginLeft: 8}}
              />
            </Title>

            {hint && (
              <Title level={4} type="secondary" style={{ marginTop: 0 }}>
                {hint}
              </Title>
            )}
          </Col>
        </Row>
        <CameraTag
          name={`${fullName} ${data.interviewName}`}
          description={`${email} ${id} ${index} ${data.createdBy}`}
          onUpload={completedQ}
          maxLength={answerTime || interviewConfig.answerTime}
        />
      </div>
    </HandleBrowsers>
  );
};
export default Record;
