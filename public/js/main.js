// helper - flag vars
debugging = true;
let loggedWith;
let flagSavingtoDB;
const amountSteps = 4; //steps the user has to do to select an appointment
// DOM elements
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
// time
const timeTableDOM = document.querySelector('.right .time');
// login form
const formNameDOM = document.getElementById('form-name');
const formEmailDOM= document.getElementById('form-email');
formNameDOM.addEventListener('keyup', checkPersonalData);
formEmailDOM.addEventListener('keyup', checkPersonalData);
// main UX steps
const taoLoginBTN = document.getElementById('one');
const taoOfficeBTN = document.getElementById('two');
const taoDateBTN = document.getElementById('three');
const taoTimeBTN = document.getElementById('four');

// event listeners for the main 4 step buttons
taoLoginBTN.addEventListener('click', () => handleMenu('one'));
taoOfficeBTN.addEventListener('click', () => handleMenu('two'));
taoDateBTN.addEventListener('click', () => handleMenu('three'));
taoTimeBTN.addEventListener('click', () => handleMenu('four'));
// event  listener for social login/logout
document.querySelector(".logout-container button").addEventListener('click', signOut);
// event listener for the date picker
datePickerDOM.addEventListener('change', (e)=> {
  if (!datePickerDOM.value) return;
  document.querySelector('.date h2').innerHTML = datePickerDOM.value;
  checkDate(datePickerDOM.value);
});
// event listeners for dropdown elements (pick an office for the appointment)
officeDropdownDOM.addEventListener('click', handleOfficeDropDown);
for (const item of officesDOM) {
  item.addEventListener('click', handleOfficeLi);
}

// data object with the user input/selection
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

// appointment configuration (agenda-schedule limits)
const startAppointmentTime = 8;
const endAppointmentTime = 17;
const appointmentPerHour = 3;

/**
 * @description checks if name and email are complete and marks as done first step
 */
function checkPersonalData() {
  const nameValue = formNameDOM.value;
  const emailValue = formEmailDOM.value;

  (nameValue === '' || nameValue.length < 6 ) ? setErrorFor(formNameDOM) : setSuccessFor(formNameDOM);
  (isEmail(emailValue)) ? setSuccessFor(formEmailDOM) : setErrorFor(formEmailDOM);

  if ((formNameDOM.parentElement.classList.contains('ok')) && (formEmailDOM.parentElement.classList.contains('ok'))) {
    //user input ok
    step1DOM.classList.add('done');

    appointmentData.name = nameValue;
    appointmentData.email = emailValue;
    appointmentData.validate.userdata = true;

    buildConfirmationTxt();
  }else{
    //something is missing, user data not completed
    step1DOM.classList.remove('done');

    appointmentData.name = null;
    appointmentData.email = null;
    appointmentData.validate.userdata = false;

    buildConfirmationTxt();
  }
}

/**
 * @description creates a brief message with all the appointment data (who, when, where)
 */
function buildConfirmationTxt(){
  // start with an empty message to rebuild everytime something change
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
    const date = new Date(appointmentData.date);
    message += `para el ${whichDay(date.getDay())} ${date.getDate()} de ${whichMonth(date.getMonth())} de ${date.getFullYear()} `;
  }
  if (appointmentData.validate.time) {
    stepsDone ++;
    message += `a las ${appointmentData.time}.`;
  }
  
  confirmationTxtDOM.innerHTML = message;

  (stepsDone === amountSteps) ? confirmAppointmentBtnDOM.classList.remove('hide') : confirmAppointmentBtnDOM.classList.add('hide');
}

/**
 * @description callbacks for the form input fields validation (success)
 * @param {type=input} domElement 
 */
function setErrorFor(domElement) {
  const formControl = domElement.parentElement;
  formControl.className = 'form-login-control ko';
}
/**
 * @description callbacks for the form input fields validation (error)
 * @param {type=input} domElement 
 */
function setSuccessFor(domElement) {
  const formControl = domElement.parentElement;
  formControl.className = 'form-login-control ok';
}

/**
 * @description quick email validation (with a regular expression)
 * @param {string} email 
 */
function isEmail(email) {
	return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
}

/**
 * @description validate selected date
 * @param {string} value 
 */
function checkDate(value) {
  const today = new Date();
  const selectedDate = new Date(value + 'T00:00:00'); //added time to fix time zone diffs with ISO
  const diffDays = Math.ceil((selectedDate - today) / (1000 * 60 * 60 * 24)); //converting to days
  const selDayNum = selectedDate.getDay(); //checking for saturday and sunday
  //nearest appointment day you can pick is tomorrow but not weekends
  if ((diffDays > 0) && ( (selDayNum !== 0) && (selDayNum !== 6) ) ) {
    datePickerDOM.parentElement.className = "date ok";
    //date ok
    step3DOM.classList.add('done');

    appointmentData.date = selectedDate;
    appointmentData.validate.date = true;

    buildConfirmationTxt();
  } else {
    datePickerDOM.parentElement.className = "date ko";

    step3DOM.classList.remove('done');

    appointmentData.date = null;
    appointmentData.validate.date = false;

    buildConfirmationTxt();
  }
}

/**
 * @description handles click on dropdown list element
 * @param {click event} e 
 */
function handleOfficeLi(e) {
  document.querySelector('.office-dropdown-content').style.visibility = 'hidden';
  officeDropdownDOM.innerHTML = e.target.innerHTML;
  document.querySelector('.office-description p').innerHTML = e.target.dataset.content; //displays office description (from html dataset)

  step2DOM.className = 'done';

  appointmentData.validate.office = true;
  appointmentData.office = e.target.dataset.id;

  buildConfirmationTxt();
}


/// lottie animations //////////////////
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
/// end lottie animations //////////////////



/**
 * @description shows office dropdown
 */
function handleOfficeDropDown() {
  document.querySelector('.office-dropdown-content').style.visibility = 'visible';
}

/// initializing app //////////////////
/**
 * @description starts loader animation
 */
function initLoader() {
    lottieCovito.play();
    renderButton(); //google login
}
/**
 * @description displays the main UI
 */
function initCard(){
    loadDOM.classList.add('hide'); //hides loader startup anim
    pageContainerDOM.style.backgroundColor = 'var(--bg-page)';
    mainCardDOM.style.transform = 'translateY(0px)';
}


/**
 * @description handles Main UX options for choosing an appointment 
 * @param {string} option 
 */
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
          // as prerequisite, office and date needs to be already selected
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


/// utils //////////////////
/**
 * @description translates the day of the week from date index number to human-named-string
 * @param {number} indx (0 - 6)
 * @returns {string} day of the week
 */
function whichDay(indx) {
  const days = [
    'Domingo', 
    'Lunes',
    'Martes', 
    'Miércoles', 
    'Jueves', 
    'Viernes', 
    'Sábado'
  ];  
  return days[indx];
}

/**
 * @description translates the month from date index number to human-named-string
 * @param {number} indx (0 - 6)
 * @returns {string} month name
 */
function whichMonth(indx) {
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

  return month[indx];
}

window.addEventListener('load', initLoader());


/// google login //////////////////
// render google sign-in button
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
// sign-in success callback
function onSuccessgGoogle(googleUser) {
  // retrieve google account data
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
// sign-in failure callback
function onFailureGoogle(error) {
  // TODO UX visuals
  console.log('error login in with google', error);
}

// sign out the user
function signOut() {
  if (loggedWith === 'google') {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
    });
    auth2.disconnect();
  } else {
    // loged with facebook
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


/// facebook login //////////////////
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
      //TODO UX visuals
      console.log('error login in with facebook', response.error);
    }
}, {scope: 'public_profile,email'});
}


/// database //////////////////
/**
 * @description fetchs data for a specific office and specific date
 */
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
  buildTimePicker(json.data);
}

/**
 * @description builds UX time table to pick an appointment free spot from the db response
 * @param {object json} data 
 */
function buildTimePicker(data) {
  const divTimeContainer = document.querySelector('.time');
  divTimeContainer.innerHTML = ''; //starting fresh, cleaning in case of previous selection
  if (data === null) {
    //nothing on that date: build and empty free grid of appointments
    if (debugging) console.log('nada >> rebuilding the schedule');
    for ( i = startAppointmentTime; i <= endAppointmentTime; i++) {
      const divTimeCol = document.createElement('div');
      divTimeCol.classList.add('time-col');

      if (debugging) console.log( i + ':00');

      const divTimeHeader = document.createElement('div');
      divTimeHeader.classList.add('time-header');
      divTimeHeader.innerText = (i < 10) ? '0'+i + ':00' : i + ':00';
      divTimeCol.appendChild(divTimeHeader);

      for ( j = 1; j <= appointmentPerHour; j++ ) { 
        if (debugging) console.log(j);
        const divTimeRow = document.createElement('div');
        divTimeRow.classList.add('time-row', 'free');
        divTimeRow.setAttribute('id', i);
        divTimeRow.addEventListener('click', pickAppointmentHour);
        divTimeCol.appendChild(divTimeRow);
       }

       if (debugging) console.log('-----------');
       const divTimeFooter = document.createElement('div');
       divTimeFooter.classList.add('time-footer');
       divTimeCol.appendChild(divTimeFooter);
       divTimeContainer.appendChild(divTimeCol);
      }
  } else {
    //something on that date. check busy appointments
    if (debugging) console.log('building a busy schedulle');

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

/**
 * @description checks on how many apointments are taken on an hour
 * @param {Array} dateAppointments All the apointments for an specific day
 * @param {number} hourToCheck Which hour of the working day is being checked 
 * @returns {number} Amount of taken spots on a specific hour
 */
  function countAppointmentTaked(dateAppointments, hourToCheck) {
    return dateAppointments.reduce((accu, elem) => {
      return ( hourToCheck === elem.hour ? accu + 1 : accu)
    }, 0);
  }


/**
 * @description handles when the user clicks on a free/busy spot of the day schedule to get an appointment
 * @param {object} e Click Event
 */
  function pickAppointmentHour(e) {
    const timePicked = e.path[0].id; //DOM Element that was clicked 

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
    if (debugging) console.log(e.path[0]);
    appointmentData.validate.time = true;
    step4DOM.classList.add('done');
    
    buildConfirmationTxt();
  }

}

/**
 * @description Contact db to record the appointment taken
 */
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
    //TODO: handle UI visuals for error writting to db
    if (debugging) console.log('error regitering appointment');
    document.querySelector('.appointment-confirmation .title').textContent = 'Sin Turno';
    document.querySelector('.appointment-detail-container').classList.add('hide');
    const subtitle = document.querySelector('.appointment-confirmation .subtitle');
    subtitle.style.color = 'var(--secondary-salmon)';
    subtitle.innerHTML = 'No fue posible registrar su turno.<BR/>Hubo un error al conectar con<BR/>la base de datos.<BR/>Por favor intente nuevamente<BR/>más tarde.';
  }
}