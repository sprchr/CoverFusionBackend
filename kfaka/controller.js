import KafkaConfig from "./config.js";

const sendToKafka = async(req,res)=>{
        try {
            
            const {message} = req.body
            const kafkaConfig = new KafkaConfig()
            const messages =[
                {key:'key1',value:message}
            ]
            kafkaConfig.producer("my-topic",messages)

            res.status(200).json({
                status:"OK",
                message:"Message Successfully Sent"
            })
        } catch (err) {
            console.log(err);
            
        }
}


const controllers = {sendToKafka}

export default controllers