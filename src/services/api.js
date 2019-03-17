import fetch from 'isomorphic-fetch';

const apiUrl = 'https://dev-a.deephire.com/v1/';
// const apiUrl = 'http://localhost:3000/v1/';

export const fetchInterview = id => {
  return fetch(`${apiUrl}interviews/${id}`)
    .then(response => response.json())
    .then(data => data);
};

export const fetchCompanyInfo = id => {
  return fetch(`${apiUrl}companies/${id}`)
    .then(response => {
      if (response.ok) return response.json();
    })
    .then(data => data);
};

export const sendEmail = data => {
  return fetch(`${apiUrl}/emails`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
    .then(response => response.json())
    .then(data => data);
};

export const storeInterviewQuestion = (
  interviewId,
  userId,
  userName,
  candidateEmail,
  interviewName,
  question,
  response
) => {
  fetch(`${apiUrl}videos`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      interviewId,
      userId,
      userName,
      candidateEmail,
      interviewName,
      responses: {
        question,
        response,
      },
    }),
  });
};

export const notifyRecruiter = (id, candidateName, candidateEmail, interviewName, createdBy) => {
  var data = {
    type: 'interviewCompleted',
    id,
    candidateName,
    email: [createdBy],
    candidateEmail,
    interviewName,
  };
  // console.log(data)

  fetch('https://dev-a.deephire.com/v1/emails', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};

export const notifyCandidate = (candidateName, candidateEmail) => {
  var data = {
    type: 'jobSeekerCompleted',
    candidateName,
    email: [candidateEmail],
    candidateEmail,
  };
  // console.log(data)

  fetch('https://dev-a.deephire.com/v1/emails', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};


export const uploadFile = (videoBlob, audioBlob) => {
  var videoData = new FormData();
  var audioData = new FormData();
  videoData.append("file", videoBlob, "videoFile" );
  audioData.append("file", audioBlob, "audioFile");
  fetch('https://dev-a.deephire.com/v1/files', {
    method: 'POST',
    body: videoData,
  });

  fetch('https://dev-a.deephire.com/v1/files', {
    method: 'POST',
    body: audioData,
  });
  
}