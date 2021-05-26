async function pickAppointmentHour(data) {
    const data2 = {
        "datos": "Hola"
    };
    const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data2)
    };

    const response = await fetch('/api', options);
    const json = await response.json();
    console.log(json);

}