const xlsx = require('xlsx');

exports.excelWriter = (sheetName, fileName, filePath, data) => {
    let newWb = xlsx.utils.book_new();
    let newWs = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(newWb, newWs, sheetName);
    xlsx.writeFile(newWb, fileName);
};

exports.excelReader = (sheetName, fileName, filePath) => {
    let wb = xlsx.readFile(fileName);
    let excelData = wb.Sheets[sheetName];
    let data = xlsx.utils.sheet_to_json(excelData);
    return data;
};

exports.excelAppend = (sheetName, fileName, filePath, data) => {
    try {
        let oldData = this.excelReader(sheetName, fileName, filePath);
        Array.prototype.push.apply(oldData, data);
        this.excelWriter(sheetName, fileName, filePath, oldData);
    } catch (err) {
        if(err.code == 'ENOENT')
        {
            this.excelWriter(sheetName, fileName, filePath, data);
        }
    }
}