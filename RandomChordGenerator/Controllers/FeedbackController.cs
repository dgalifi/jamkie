using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using MongoDB.Bson;
using MongoDB.Driver;
using RandomChordGenerator.Models;

namespace RandomChordGenerator.Controllers
{
    public class FeedbackController : ApiController
    {
        protected static IMongoClient _client;
        protected static IMongoDatabase _database;

        [HttpPost]
        public async Task<string> SendFeedback(Feedback feedback)
        {
            if (feedback!= null && ModelState.IsValid)
            {
                string cs = ConfigurationManager.AppSettings["gbt_mongodb"];

                _client = new MongoClient(cs);
                _database = _client.GetDatabase("gbt_db");

                var collection = _database.GetCollection<BsonDocument>("feedbacks");

                var document = new BsonDocument
                {
                    {"email", feedback.email},
                    {"score", feedback.score},
                    {"comment", feedback.comment}
                };

                await collection.InsertOneAsync(document);

                return "ok";
            }

            return "error";
        }
    }
}
