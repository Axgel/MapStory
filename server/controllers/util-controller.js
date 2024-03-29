const {convert} = require('geojson2shp');
const fs = require('fs');
const os = require("os");

exportSHPDBF = async(req,res) =>{
    try{
        const {geojson} = req.body
        let path = `${os.tmpdir()}/file_shp.zip`;
        const options = {
            layer: 'file',
            encoding: "UTF-8"
        }
        let stream = fs.createWriteStream(path)
        await convert(geojson, stream, options);
        res.status(200).sendFile(path)
        fs.readFile(path, (err, data)=>{
            if(err){
                return res.status(500).json({
                    error: err
                })
            }
            fs.unlink(path, (err) =>{
                if(err){
                    return res.status(500).json({
                        error: err
                    })
                }
            });
        });
    }catch(err){
        return res.status(500).json({
            error: "Failed to Export to SHP File"
        })
    }
}

module.exports ={
    exportSHPDBF
}