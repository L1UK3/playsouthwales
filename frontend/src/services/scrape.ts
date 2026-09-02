function Sample() {
    let options = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            APIKEY: import.meta.env.VITE_POKEDATA_KEY,
            players: [
                { name: 'Luke Enness', game: 'tcg', division: 'master' },
            ],
        }),
    };

    fetch('https://pokedata.ovh/2026/api/', options)
        .then((response) => response.json())
        .then((response_json) => {
            console.log(response_json);
        })
        .catch((err) => {
            console.error('Fetch error:', err);
        });
}

Sample();
