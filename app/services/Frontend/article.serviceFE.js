const articleSchema = require(__path_schemas + "article.Schemas");

const listArticleSpecial = (params = null, option = null) =>{
   return new Promise(async(resolve, reject)=>{
      let resultList = await articleSchema.listArticleSpecial(params, option);
      if(resultList){
         return resolve(resultList);
      }else{
         return reject("loi sv: resultList");
      } 
   }); 
};
export default {
   listArticleSpecial,
};
