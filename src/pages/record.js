import practiceQuestions from '@/services/practiceInterviewQuestions';
import React, { useState, useEffect } from 'react';

import ReactPlayer from 'react-player';
import { Steps, Modal, Timeline, Button, Row, Col } from 'antd';
import styles from './record.less';
import qs from 'qs';
import LoadingScreen from 'react-loading-screen';

import { camerakit } from './assets/camerakit-web.min.js';
import { fetchInterview, notifyRecruiter } from '@/services/api';
import vimeoUpload from './vimeo.js';
import Timer from '@/components/Timer';
import { router } from 'umi';
const Step = Steps.Step;

let myStream;
export default ({ location }) => {
  const id = qs.parse(location.search)['?id'];
  const fullName = qs.parse(location.search)['fullName'];
  const email = qs.parse(location.search)['email'];
  const practice = qs.parse(location.search)['practice'];

  const [before, setBefore] = useState(true);

  const [videosUploading, setVideosUploading] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [videoUrl, setVideoUrl] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);
  const [index, setIndex] = useState(0);
  const [data, setData] = useState(null);
  const [retakes, setRetakes] = useState(null);
  const [buttonAction, setButtonAction] = useState(null);
  const [interview, setInterview] = useState(null);
  const [startingData, setStartingData] = useState({ interviewQuestions: [{ question: 'test' }] });

  const start = async (index, startingData) => {
    recordScreen(startingData);

    const devices = await camerakit.getDevices();
    myStream = await camerakit.createCaptureStream({
      audio: devices.audio[0],
      video: devices.video[0],
    });

    myStream.setResolution({ aspect: 16 / 9 });
    myStream.recorder.start();
    const streamUrl = await myStream.getMediaStream();
    setVideoUrl(streamUrl);
  };

  const prepareScreen = startingData => {
    setInterview({
      key: 0,
      paused: false,
      time: startingData.prepTime,
      countDown: true,
      buttonText: 'Start Recording',
      helperText: 'Prepare your answer',
    });
    setButtonAction((index, startingData) => (index, startingData) => start(index, startingData));
    setVideoUrl(null);
  };

  const recordScreen = startingData => {
    setInterview({
      key: 1,
      time: startingData.answerTime,
      paused: false,
      countDown: false,
      buttonText: 'Stop Recording',
      helperText: 'Recording...',
    });
    setButtonAction((index, startingData) => (index, startingData) => stop(index, startingData));
  };
  const reviewScreen = (index, startingData) => {
    setInterview({
      key: 2,
      time: startingData.prepTime,
      paused: true,
      countDown: true,
      buttonText: 'Next Question',
      review: true,
      helperText: 'Review your video',
      controls: true,
    });
    setButtonAction(
      (index, startingData, videoBlob, interviewName, question) => (
        index,
        startingData,
        videoBlob,
        interviewName,
        question
      ) => nextQuestion(index, startingData, videoBlob, interviewName, question)
    );
  };

  const nextQuestion = (index, startingData, videoBlob, interviewName, question) => {
    if (!practice) {
      var uploadStatus = vimeoUpload(
        videoBlob,
        id,
        email,
        fullName,
        email,
        interviewName,
        question
      );

      //IMPORTANT i don't think this works completly
      var status = [...videosUploading, uploadStatus];
    }
    setVideosUploading(status);
    prepareScreen(startingData);
    if (startingData.interviewQuestions.length === index + 1) {
      if (practice) router.push(`/real?id=${id}&fullName=${fullName}&email=${email}`);
      else {
        setUploading(true);
        Promise.all(status).then(r => {
          console.log(videosUploading);
          console.log(r);
          setUploading(false);
          notifyRecruiter(
            id,
            fullName,
            email,
            interviewName,
          );
          router.push('/victory');
        });
      }
    } else {
      setIndex(index + 1);
    }
  };

  const retake = () => {
    if (retakes > 0) {
      setRetakes(retakes - 1);
      prepareScreen(startingData);
    }
  };

  const stop = (index, startingData) => {
    const recordedVideo = myStream.recorder.stop();
    const objectURL = URL.createObjectURL(recordedVideo);
    setVideoBlob(recordedVideo);
    myStream.destroy();
    setVideoUrl(objectURL);

    reviewScreen(index, startingData);
  };

  // for any hooks noobs, passing in [] as 2nd paramater makes useEffect work the same for componenetDidMount
  useEffect(() => {
    if (!practice) setBefore(false);

    fetchInterview(id).then(data => {
      if (practice) data = practiceQuestions;
      setData(data[0]);
      const {
        interviewName,
        interview_config: { answerTime, prepTime, retakesAllowed } = {},
        interview_questions: interviewQuestions = [],
      } = data[0] || {};
      setStartingData({ interviewName, answerTime, prepTime, retakesAllowed, interviewQuestions });
      setRetakes(retakesAllowed);
      setInterview({
        key: 0,
        paused: true,
        time: prepTime,
        countDown: true,
        buttonText: 'Start Recording',
        // helperText: "Good luck!"
      });
    });
    setButtonAction((index, startingData) => (index, startingData) => start(index, startingData));
  }, []);
  if (!data) return null;

  if (!interview) return null;

  return (
    <div className={styles.normal}>
      <LoadingScreen
        loading={uploading}
        bgColor="#f1f1f1"
        spinnerColor="#9ee5f8"
        textColor="#676767"
        text="Uploading your videos"
      />
      <div style={{ paddingTop: '24px' }}>
        <h1> {before ? 'Whats Next' : startingData.interviewQuestions[index].question}</h1>{' '}
        {interview.helperText}
      </div>
      {!before && (
        <Timer
          key={interview.key}
          reset={true}
          countDown={interview.countDown}
          paused={interview.paused}
          onFinish={() => buttonAction(index, startingData)}
          seconds={interview.time}
        />
      )}
      <br />

      <Row type="flex" justify="center">
        <Col span={15}>
          {before ? (
            <>
              <h3>{`You’ll be taken to a Practice Interview (2 Questions) so you can get used to the system. After you finish the Practice Interview, there is a break (30 seconds), and then your real interview will begin! Good luck! `}</h3>
              <br /> <br />
              <h4>Each questions follows the following format:</h4>
              <br />
              <br />
              <Timeline mode="alternate">
                <Timeline.Item>{`${startingData.prepTime} Seconds to Prepare`}</Timeline.Item>
                <Timeline.Item color="blue">{`${
                  startingData.answerTime
                } Seconds to Record`}</Timeline.Item>
                <Timeline.Item color="red">Review Video Answer</Timeline.Item>
              </Timeline>
            </>
          ) : (
            <div className={styles.playerWrapper}>
              {interview.key === 0 ? (
                <img
                  height="100%"
                  // width="100%"
                  className={styles.img}
                  // src="https://icons-for-free.com/free-icons/png/512/1511312.png"
                  src="https://s3.amazonaws.com/deephire/logos/undrawThinking.png"
                  alt="Prepare to Record!"
                />
              ) : (
                <ReactPlayer
                  key={videoUrl}
                  className={styles.reactPlayer}
                  playing
                  muted
                  controls={interview.controls}
                  url={videoUrl}
                  width="100%"
                  height="100%"
                />
              )}
            </div>
          )}
        </Col>
      </Row>
      {before ? (
        <Button
          className={styles.button}
          onClick={() => {
            setBefore(false);
            setInterview({ ...interview, helperText: 'Prepare your answer', paused: false });
          }}
        >
          Start Pracice Interview
        </Button>
      ) : (
        <>
          {interview.review && <Button onClick={retake}>{`Retake (${retakes} left)`}</Button>}
          <Button
            className={styles.button}
            onClick={() =>
              buttonAction(
                index,
                startingData,
                videoBlob,
                startingData.interviewName,
                startingData.interviewQuestions[index].question
              )
            }
          >
            {interview.buttonText}
          </Button>
        </>
      )}

      {/* <Button onClick={start}>start</Button>
      <Button onClick={stop}>stop</Button> */}
    </div>
  );
};