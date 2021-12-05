const request = require('request');
const cheerio = require('cheerio');
const util = require('util');
const excel = require('./excel');
const requestPromise = util.promisify(request);

const data = async() => {
    const htmlData = await requestPromise('https://www.espncricinfo.com/series/ipl-2020-21-1210595');
    return htmlData.body;
}

data().then(async(data) =>{
    let $ = cheerio.load(data);
    let resultLink = $(".widget-items.cta-link .label.blue-text.blue-on-hover").attr('href');
    const fullLink = 'https://www.espncricinfo.com/' + resultLink;
    
    const temp = await callAnotherPage(fullLink).then(htmlResponse => {
        return htmlResponse.body;
    }).then(body => {
        return body;
    }); 
    
    $ = cheerio.load(temp);
    let matchesArr = $(".match-cta-container");
    for(let i=0;i<matchesArr.length;i++)
    {
        let buttons = $(matchesArr[i]).find("a");
        for(let j=2;j<buttons.length;j+=2)
        {
            let button = $(buttons[j]).attr('href');
            console.log(button);
            const link = 'https://www.espncricinfo.com' + button;
            request(link, matchDetails);
        }
    }
});

const callAnotherPage = async(fullLink) => {
    const htmlData = await requestPromise(fullLink);
    return htmlData;
}

function matchDetails(error, response, body) {
    let $ = cheerio.load(body);
    let tablesArr = $(".card.content-block.match-scorecard-table .Collapsible");
    let table1 = $(tablesArr[0]);
    let table2 = $(tablesArr[1]);
    let team1 = table1.find("h5");
    team1 = team1.text().split("INNINGS")[0].trim();
    let team2 = table2.find("h5");
    team2 = team2.text().split("INNINGS")[0].trim();
    let batsmanData1 = $(table1).find(".table.batsman tbody");
    let bowlerData1 = $(table1).find(".table.bowler tbody");
    let batsmanData2 = $(table2).find(".table.batsman tbody");
    let bowlerData2 = $(table2).find(".table.bowler tbody");
    let batsmanPlayer1 = $(batsmanData1).find("tr");
    let batsmanPlayer2 = $(batsmanData2).find("tr");
    let jsonData1 = [];
    for (let i = 0; i < batsmanPlayer1.length; i++) {
        let data = $(batsmanPlayer1[i]).find("td");
        if ($(data[0]).text() !== '' && $(data[0]).text() !== 'Extras') {
            jsonData1.push({
                'name': $(data[0]).text().trim(),
                'run': $(data[2]).text().trim(),
                'balls': $(data[3]).text().trim(),
                '4s': $(data[5]).text().trim(),
                '6s': $(data[6]).text().trim(),
                'SR': $(data[7]).text().trim(),
                'opponent team': team2
            })
        }
    }
    let jsonData2 = []
    for (let i = 0; i < batsmanPlayer2.length; i++) {
        let data = $(batsmanPlayer2[i]).find("td");
        if ($(data[0]).text() !== '' && $(data[0]).text() !== 'Extras') {
            jsonData2.push({
                'name': $(data[0]).text().trim(),
                'run': $(data[2]).text().trim(),
                'balls': $(data[3]).text().trim(),
                '4s': $(data[5]).text().trim(),
                '6s': $(data[6]).text().trim(),
                'SR': $(data[7]).text().trim(),
                'opponent team': team1
            })
        }
    }
    excel.excelAppend("sheet-1", team1 + ".xlsx", "/Desktop", jsonData1);
    excel.excelAppend("sheet-1", team2 + ".xlsx", "/Desktop", jsonData2);
    
}


//request('https://www.espncricinfo.com/series/ipl-2020-21-1210595/delhi-capitals-vs-mumbai-indians-final-1237181/full-scorecard', matchDetails);