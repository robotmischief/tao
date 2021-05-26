const pageContainerDOM = document.querySelector('.page-container');
const mainCardDOM = document.querySelector('.main-card');
const loadDOM = document.getElementById('loading');
const homeAnimDOM = document.getElementById('anim-home');
const appointBtnAnimDOM = document.getElementById('appointment-anim-btn');
const officeDropdownDOM = document.querySelector('.office-dropdown-btn');
const officesDOM = document.querySelectorAll('.office-dropdown-content li');
const datePickerDOM = document.getElementById('date-appointment');
// steps
const step1DOM = document.getElementById('one').querySelector('span');
const step2DOM = document.getElementById('two').querySelector('span');
const step3DOM = document.getElementById('three').querySelector('span');
const step4DOM = document.getElementById('four').querySelector('span');
// confirmation message
const confirmationTxtDOM = document.querySelector('.confirmation-txt');
const confirmAppointmentBtnDOM = document.getElementById('confirm-btn');
confirmAppointmentBtnDOM.addEventListener('click', takeAppointment);
//time
const timeTableDOM = document.querySelector('.right .time');
// timeTableDOM.addEventListener('click', hadleTimeSelection);

let loggedWith;
let flagSavingtoDB;
// track vars
const appointmentData = {
  name: null,
  email: null,
  office: null,
  date: null,
  time: null,
  validate: {
    userdata: false,
    office: false,
    date: false,
    time: false
  }
};
const startAppointmentTime = 8;
const endAppointmentTime = 17;
const appointmentPerHour = 3;

const formNameDOM = document.getElementById('form-name');
const formEmailDOM= document.getElementById('form-email');
formNameDOM.addEventListener('keyup', checkPersonalData);
formEmailDOM.addEventListener('keyup', checkPersonalData);

//  document.getElementById('restart-btn').addEventListener('click', ()=>  document.location.href = 'localhost:3000');

function checkPersonalData() {
  const nameValue = formNameDOM.value;
  const emailValue = formEmailDOM.value;

  (nameValue === '' || nameValue.length < 6 ) ? setErrorFor(formNameDOM) : setSuccessFor(formNameDOM);
  (isEmail(emailValue)) ? setSuccessFor(formEmailDOM) : setErrorFor(formEmailDOM);

  if ((formNameDOM.parentElement.classList.contains('ok')) && (formEmailDOM.parentElement.classList.contains('ok'))) {
    step1DOM.classList.add('done');
    
    // readyCheck.personalData = true; //switch

    appointmentData.name = nameValue;
    appointmentData.email = emailValue;
    appointmentData.validate.userdata = true;

    buildConfirmationTxt();
    
  }else{
    //something is missing user data nor completed
    step1DOM.classList.remove('done');

    // readyCheck.personalData = false; //switch

    appointmentData.name = null;
    appointmentData.email = null;
    appointmentData.validate.userdata = false;

    buildConfirmationTxt();
  }
}

function buildConfirmationTxt(){
  //starting from an empty message
  let stepsDone = 0;
  let message = 'Solicitando turno ';
  confirmationTxtDOM.innerHTML = message;

  if (appointmentData.validate.userdata) {
    stepsDone ++;
    message += `para ${formNameDOM.value} `;
  }
  if (appointmentData.validate.office) {
    stepsDone ++;
    message += `en la ${officeDropdownDOM.textContent} `;
  }
  if (appointmentData.validate.date) {
    stepsDone ++;
    // const date = new Date(datePickerDOM.value+'T00:00:00');
    const date = new Date(appointmentData.date);
    message += `para el ${whichDay(date.getDay())} ${date.getDate()} de ${whichMonth(date.getMonth())} de ${date.getFullYear()} `;
  }
  if (appointmentData.validate.time) {
    stepsDone ++;
    message += `a las ${appointmentData.time}.`;
  }
  
  confirmationTxtDOM.innerHTML = message;

  (stepsDone === 4) ? confirmAppointmentBtnDOM.classList.remove('hide') : confirmAppointmentBtnDOM.classList.add('hide');
}

function setErrorFor(domElement) {
  const formControl = domElement.parentElement;
  formControl.className = 'form-login-control ko';
}
function setSuccessFor(domElement) {
  const formControl = domElement.parentElement;
  formControl.className = 'form-login-control ok';
}

function isEmail(email) {
	return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
}

datePickerDOM.addEventListener('change', (e)=> {
  console.log('DATE PICKED', datePickerDOM.value);
  if (!datePickerDOM.value) return;
  document.querySelector('.date h2').innerHTML = datePickerDOM.value;
  checkDate(datePickerDOM.value);
});


//////////////////////////
//DATE
function checkDate(value) {
  const today = new Date();
  const selectedDate = new Date(value + 'T00:00:00'); //added time to fix time zone diffs with ISO
  const diffDays = Math.ceil((selectedDate - today) / (1000 * 60 * 60 * 24));
  //you can take an appointment for today, nearest appointment day is tomorrow
  if (diffDays > 0 ) {
    datePickerDOM.parentElement.className = "date ok";
    step3DOM.classList.add('done');

    // readyCheck.appointmentdate = true; //switch

    appointmentData.date = selectedDate;
    appointmentData.validate.date = true;

    date = selectedDate; //switch
    buildConfirmationTxt();

  } else {
    datePickerDOM.parentElement.className = "date ko";

    step3DOM.classList.remove('done');

    // readyCheck.appointmentdate = false;//switch

    appointmentData.date = null;
    appointmentData.validate.date = false;

    buildConfirmationTxt();
  }
}

// event listener for picking office
for (const item of officesDOM) {
  item.addEventListener('click', handleOfficeLi);
}
//////////////////////////////
// OFFICE
function handleOfficeLi(e) {
  document.querySelector('.office-dropdown-content').style.visibility = 'hidden';
  officeDropdownDOM.innerHTML = e.target.innerHTML;
  document.querySelector('.office-description p').innerHTML = e.target.dataset.content;

  step2DOM.className = 'done';

  // readyCheck.office = true; //switch

  appointmentData.validate.office = true;
  appointmentData.office = e.target.dataset.id;

  office = e.target.dataset.id; //switch

  buildConfirmationTxt();
}


///////////////////////////////
// lottie animations
const lottieCovito = lottie.loadAnimation({
    container: loadDOM, 
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'images/loading_covito.json'
  });

lottieCovito.addEventListener('loopComplete', () =>{
    if (lottieCovito.playCount === 1) {
        lottieCovito.stop()
        initCard();
    }
  });

const lottieHomeAnim = lottie.loadAnimation({
  container: homeAnimDOM,
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: 'images/home_anim.json'
});

const appointBtnAnim = lottie.loadAnimation({
  container: appointBtnAnimDOM,
  renderer: 'svg',
  loop: false,
  autoplay: false,
  path: 'images/sanitizer_anim.json'
});

appointBtnAnim.addEventListener('complete', ()=> {
  document.querySelector('.tao .left').style.transform = 'translateY(-470px)';
  document.querySelector('.tao .right').style.transform = 'translateY(-1880px)'; //move directly to user and email screen
  document.querySelector('.tao .left .login').style.opacity = '1';
})

appointBtnAnimDOM.parentElement.addEventListener('click', ()=> {
  appointBtnAnim.play();
})

//event listener para office dropdown
officeDropdownDOM.addEventListener('click', handleOfficeDropDown);

function handleOfficeDropDown() {
  document.querySelector('.office-dropdown-content').style.visibility = 'visible';
}

function initLoader() {
    lottieCovito.play();
    renderButton();
}

function initCard(){
    loadDOM.classList.add('hide');
    pageContainerDOM.style.backgroundColor = 'var(--bg-page)';
    mainCardDOM.style.transform = 'translateY(0px)';
}

const taoLoginBTN = document.getElementById('one');
const taoOfficeBTN = document.getElementById('two');
const taoDateBTN = document.getElementById('three');
const taoTimeBTN = document.getElementById('four');
//event listeners for main 4 steps buttons
taoLoginBTN.addEventListener('click', () => handleMenu('one'));
taoOfficeBTN.addEventListener('click', () => handleMenu('two'));
taoDateBTN.addEventListener('click', () => handleMenu('three'));
taoTimeBTN.addEventListener('click', () => handleMenu('four'));
//event  listener for social login/logout
document.querySelector(".logout-container button").addEventListener('click', signOut);


///////////////////////
// Main Steps 4 Menues
function handleMenu(option) {
  if (flagSavingtoDB) return; //saving appointment to the db

  switch(option) {
    case 'one':
      taoLoginBTN.classList.add('active');
      taoOfficeBTN.classList.remove('active');
      taoDateBTN.classList.remove('active');
      taoTimeBTN.classList.remove('active');
      document.querySelector('.tao .right').style.transform = 'translateY(-1880px)';
      break;

    case 'two':
      taoLoginBTN.classList.remove('active');
      taoOfficeBTN.classList.add('active');
      taoDateBTN.classList.remove('active');
      taoTimeBTN.classList.remove('active');
      document.querySelector('.tao .right').style.transform = 'translateY(-1410px)';
      break;
      
      case 'three':
        taoLoginBTN.classList.remove('active');
        taoOfficeBTN.classList.remove('active');
        taoDateBTN.classList.add('active');
        taoTimeBTN.classList.remove('active');
        document.querySelector('.tao .right').style.transform = 'translateY(-940px)';
        break;
        
        case 'four':
          //prerequisit office and date selected
          if ( !appointmentData.validate.office || !appointmentData.validate.date) return;

          taoLoginBTN.classList.remove('active');
          taoOfficeBTN.classList.remove('active');
          taoDateBTN.classList.remove('active');
          taoTimeBTN.classList.add('active');
          step4DOM.classList.remove('done');
          appointmentData.validate.time = false;
          appointmentData.time = null;
          buildConfirmationTxt();
          dbFetchAppointments();//fetch from database
          document.querySelector('.tao .right').style.transform = 'translateY(-470px)';
      break;

    default:
        taoLoginBTN.classList.remove('active');
        taoOfficeBTN.classList.remove('active');
        taoDateBTN.classList.remove('active');
        taoTimeBTN.classList.remove('active');
        break;
      
  }
}

// UTILS //
function whichDay(date) {
  const days = [
    'Domingo', 
    'Lunes', 'Martes', 
    'Miércoles', 
    'Jueves', 
    'Viernes', 
    'Sábado'
  ];  
  return days[date];
}


function whichMonth(date) {
  const month = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ];

  return month[date];
}

window.addEventListener('load', initLoader());


// GOOGLE login
// Render Google Sign-in button
function renderButton() {
  gapi.signin2.render('gSignIn', {
      'scope': 'profile email',
      'width': 200,
      'height': 30,
      'longtitle': true,
      'theme': 'light',
      'onsuccess': onSuccessgGoogle,
      'onfailure': onFailureGoogle
  });
}
// Sign-in success callback
function onSuccessgGoogle(googleUser) {
  // Retrieve the Google account data
  gapi.client.load('oauth2', 'v2', function () {
      var request = gapi.client.oauth2.userinfo.get({
          'userId': 'me'
      });
      request.execute(function (resp) {
          formNameDOM.value = resp.name;
          formEmailDOM.value = resp.email;
          document.querySelector(".login-container").classList.add('hide');
          document.querySelector(".logout-container").classList.remove('hide');
          checkPersonalData();
          loggedWith = 'google';
      });
  });
}
// Sign-in failure callback
function onFailureGoogle(error) {
  console.log('error login in with google', error);
}

// Sign out the user
function signOut() {
  if (loggedWith === 'google') {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
    });
    auth2.disconnect();
  } else {
    //facebook
    FB.logout(function(response) {
      console.log('LOGOUT FACEBOOK');
    });
  }
  document.querySelector(".login-container").classList.remove('hide');
  document.querySelector(".logout-container").classList.add('hide');
  formNameDOM.value = '';
  formEmailDOM.value = '';
  checkPersonalData();
}

//////////
//sigin facebook
function checkLoginState() {
  FB.login(function(response) {
    if (response.authResponse) {
     FB.api('/me', { locale: 'es_ES', fields: 'name, email' }, function(response) {
      formNameDOM.value = response.name;
      formEmailDOM.value = response.email;
      document.querySelector(".login-container").classList.add('hide');
      document.querySelector(".logout-container").classList.remove('hide');
      checkPersonalData();
     });
    } else {
      console.log('error login in with facebook', response.error);
    }
}, {scope: 'public_profile,email'});
}



//DATABASE STUFF
async function dbFetchAppointments() {
  const data = {
    "office": appointmentData.office,
    "date": appointmentData.date
  };
const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
};

const response = await fetch('/api/appointments', options);
const json = await response.json();
console.log('respuesta db', json);
buildTimePicker(json.data)
}
// Builds time table to pick appointment spot
function buildTimePicker(data) {
  const divTimeContainer = document.querySelector('.time');
  divTimeContainer.innerHTML = ''; //starting fresh, cleaning in case of previous selection
  if (data === null) {
    //nothing on that date
    console.log('no hay nada rebuilding the schedulle');
    for ( i = startAppointmentTime; i <= endAppointmentTime; i++) {
      const divTimeCol = document.createElement('div');
      divTimeCol.classList.add('time-col');

      console.log( i + ':00');

      const divTimeHeader = document.createElement('div');
      divTimeHeader.classList.add('time-header');
      divTimeHeader.innerText = (i < 10) ? '0'+i + ':00' : i + ':00';
      divTimeCol.appendChild(divTimeHeader);

      for ( j = 1; j <= appointmentPerHour; j++ ) { 
        console.log(j);
        const divTimeRow = document.createElement('div');
        divTimeRow.classList.add('time-row', 'free');
        divTimeRow.setAttribute('id', i);
        divTimeRow.addEventListener('click', pickAppointmentHour);
        divTimeCol.appendChild(divTimeRow);
       }

       console.log('-----------');
       const divTimeFooter = document.createElement('div');
       divTimeFooter.classList.add('time-footer');
       divTimeCol.appendChild(divTimeFooter);
       divTimeContainer.appendChild(divTimeCol);
      }
  } else {
    //something on that date
    console.log('hay algo the schedulle');
    // const divTimeContainer = document.querySelector('.time');

    for ( i = startAppointmentTime; i <= endAppointmentTime; i++) {
      const divTimeCol = document.createElement('div');
      divTimeCol.classList.add('time-col');

      const divTimeHeader = document.createElement('div');
      divTimeHeader.classList.add('time-header');
      divTimeHeader.innerText = (i < 10) ? '0'+i + ':00' : i + ':00';
      divTimeCol.appendChild(divTimeHeader);

      const appointmentsTaken = countAppointmentTaked(data, i);
      const appointmentsFree = appointmentPerHour - appointmentsTaken;

      //busy spots
      for ( j = 1; j <= appointmentsTaken ; j++ ){
        const divTimeRow = document.createElement('div');
        divTimeRow.classList.add('time-row', 'busy');
        divTimeRow.setAttribute('id', i);
        divTimeCol.appendChild(divTimeRow);
      }
      //free spots
      for ( j = 1; j <= appointmentsFree ; j++ ){
        const divTimeRow = document.createElement('div');
        divTimeRow.classList.add('time-row', 'free');
        divTimeRow.setAttribute('id', i);
        divTimeRow.addEventListener('click', pickAppointmentHour);
        divTimeCol.appendChild(divTimeRow);
      }

       const divTimeFooter = document.createElement('div');
       divTimeFooter.classList.add('time-footer');
       divTimeCol.appendChild(divTimeFooter);
       divTimeContainer.appendChild(divTimeCol);
      }
  }


  function countAppointmentTaked(dateAppointments, hourToCheck) {
    return dateAppointments.reduce((accu, elem) => {
      return ( hourToCheck === elem.hour ? accu + 1 : accu)
    }, 0);
  }


  /////////////////////////////////////7
  //TIME OF APPOINTMENT
  function pickAppointmentHour(e) {
    const timePicked = e.path[0].id;

    //already selected?
    if (e.path[0].classList.contains('selected')){
      e.path[0].classList.remove('selected');
      appointmentData.time = null;
      appointmentData.validate.time = false;
      step4DOM.classList.remove('done');
      buildConfirmationTxt();
      return;
    }

    const timeRowElements = document.querySelectorAll('.time-row');
    for (element of timeRowElements) {
      if (element.classList.contains('selected')) {
        element.classList.remove('selected');
      }
    }
    e.path[0].classList.add('selected');
    appointmentData.time = e.path[0].id;
    console.log(e.path[0]);
    appointmentData.validate.time = true;
    step4DOM.classList.add('done');
    
    buildConfirmationTxt();
  }

}

async function takeAppointment() {
    confirmAppointmentBtnDOM.classList.add('hide');
    flagSavingtoDB = true;
    document.querySelector('.tao .right').style.transform = 'translateY(0px)';

  const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData)
  };
  
  const response = await fetch('/api/takeappointment', options);
  const json = await response.json();
  console.log('respuesta  INSERT db', json);

  if (json.status === "ok") {
    //UI content
    document.getElementById('confirm-name').textContent = json.data.name;
    document.getElementById('confirm-date').textContent = json.data.date;
    document.getElementById('confirm-time').textContent = json.data.hour;
    document.getElementById('confirm-office').textContent = json.data.office;
  }else{
    //TODO: handle UI for error writting to db
  }
}