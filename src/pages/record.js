import practiceQuestions from '@/services/practiceInterviewQuestions';
import React, { useState, useEffect } from 'react';

import ReactPlayer from 'react-player';
import { Timeline, Button, Row, Col } from 'antd';
import styles from './record.less';
import qs from 'qs';
import LoadingScreen from 'react-loading-screen';

import { camerakit } from '@/services/browser.min.js';
import { fetchInterview, notifyRecruiter, notifyCandidate, uploadFile } from '@/services/api';
import vimeoUpload from './vimeo.js';
import Timer from '@/components/Timer';
import { router } from 'umi';

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
  const [audioBlob, setAudioBlob] = useState(null);

  const [index, setIndex] = useState(0);
  const [data, setData] = useState(null);
  const [retakes, setRetakes] = useState(null);
  const [interview, setInterview] = useState({
    key: 0,
    paused: true,
    time: 45,
    countDown: true,
    buttonText: 'Start Recording',
  });
  const [action, setAction] = useState('start');

  const [startingData, setStartingData] = useState({ interviewQuestions: [{ question: 'test' }] });

  // for any hooks noobs, passing in [] as 2nd paramater makes useEffect work the same for componenetDidMount
  useEffect(() => {
    if (!practice) setBefore(false);
    setup();
    setAction('start');
    initializeCameraKit()
  }, []);

  const setup = async () => {
    var [data] = await fetchInterview(id);
    if (practice) data = practiceQuestions;
    setData(data);
    const {
      interviewName,
      interview_config: { answerTime, prepTime, retakesAllowed } = {},
      interview_questions: interviewQuestions = [],
    } = data || {};
    setStartingData({ interviewName, answerTime, prepTime, retakesAllowed, interviewQuestions });
    setRetakes(retakesAllowed);
    setInterview({
      ...interview, 
      time: prepTime,
    });
  };

  const initializeCameraKit = async () => {
    camerakit.Loader.base = "/webm";

    const devices = await camerakit.getDevices();
    myStream = await camerakit.createCaptureStream({
      audio: devices.audio[0],
      video: devices.video[0],
      fallbackConfig: {
        base: "/webm" // Point fallback recorder
      }
    });
    myStream.init()
  }
  const changeButtonAction = action => {
    switch (action) {
      case 'start':
        return start();

      case 'stop':
        return stop();

      case 'nextQuestion':
        return nextQuestion();

      default:
        return console.log('uh oh case returned default');
    }
  };

  const start = async () => {
    recordScreen();
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
    setAction('start');
    setVideoUrl(null);
  };

  const recordScreen = () => {
    setInterview({
      key: 1,
      time: startingData.answerTime,
      paused: false,
      countDown: false,
      buttonText: 'Stop Recording',
      helperText: 'Recording...',
    });
    setAction('stop');
  };

  const reviewScreen = () => {
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
    setAction('nextQuestion');
  };

  const nextQuestion = () => {
    if (!practice) {
      var uploadStatus = vimeoUpload(
        videoBlob,
        id,
        email,
        fullName,
        email,
        startingData.interviewName,
        startingData.interviewQuestions[index].question
      );
      if (audioBlob) { uploadFile(videoBlob, audioBlob, email, startingData.interviewQuestions[index].question) }


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
          notifyRecruiter(id, fullName, email, startingData.interviewName);
          notifyCandidate(fullName, email);
          myStream.destroy();

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

  const stop = async () => {
    //recorded Audio only exists in safari
    const [recordedVideo, recordedAudio] = await myStream.recorder.stop();
    var videoUrl = URL.createObjectURL(recordedVideo);
    if (recordedAudio)  videoUrl = URL.createObjectURL(recordedAudio);
    setVideoBlob(recordedVideo);
    setAudioBlob(recordedAudio)
    setVideoUrl(videoUrl);
    reviewScreen();
  };

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
          onFinish={() => changeButtonAction(action)}
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
                <>

                <ReactPlayer
                  key={videoUrl}
                  className={styles.reactPlayer}
                  playing
                  // muted
                  controls={interview.controls}
                  url={videoUrl}
                  width="100%"
                  height="100%"
                />
            {audioBlob && interview.review && <div                   className={styles.reactPlayer}
 >WARNING - There is no video playback here for Safari - once you submit, your recrutier will be able to see both your video and audio.</div> }


                </>

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
          <Button className={styles.button} onClick={() => changeButtonAction(action)}>
            {interview.buttonText}
          </Button>
        </>
      )}
    </div>
  );
};
