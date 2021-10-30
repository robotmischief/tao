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