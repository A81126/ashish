const form = document.querySelector('form');
const submitBtn = document.querySelector('button');
const responseSection = document.querySelector('.response-section');

submitBtn.addEventListener('click', (e) => {
    console.log(submitBtn);
    e.preventDefault();
    const appname = form[0].value;
    const url = "http://localhost:5000/detector";
    const options = {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appname })
    }
    fetch(url, options)
        .then(response => response.json())
        .then(data => {
            console.log(responseSection);
            if (data.length < 1) {
                responseSection.innerHTML = `
                <div class="alert alert-danger" role="alert">
                App Name not Found
              </div>
                    `;
            } else {
                const { id, appname, sentimentScore, appstatus } = data;

                responseSection.innerHTML = `
                <div class="table-responsive">
                <table class="table">
                <thead>
                <tr>
               
                  <th scope="col">App Name</th>
                  <th scope="col">Sentiment Analysis Score</th>
                  <th scope="col">App Status</th>
                </tr>
              </thead>
              <tr>
     
                        <td>${appname} </td>
                        <td>${sentimentScore}</td>
                        <td>${appstatus}</td>
            </tr>
                </table>
                </div>
                
                `;
            }


            ;
        })
        .catch(err => console.log(err));
})


const show = (e) => {

    alert('hello');

}