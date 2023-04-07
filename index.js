/*Após criar a rota POST no exercício anterior, é necessário implementar uma rota do tipo POST com o path "/sessions" que receba um username e password.

Na rota POST com o path "/sessions", devem ser recebidos um username e password como parâmetros da requisição. Em seguida, a aplicação deve verificar se o usuário existe no banco de dados. Se o usuário existir, deve ser gerado um token JWT (JSON Web Token) contendo o id do usuário e injetado no corpo da resposta.

É importante garantir que o token seja gerado com segurança, seguindo as boas práticas de codificação e criptografia. Além disso, é importante que as informações sejam retornadas de forma clara e organizada para que a integração com outros sistemas ou aplicações seja facilitada.
*/

const express = require('express');
const connection = require('./src/database');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const Place = require('./src/models/places');
const User = require('./src/models/users');

const app = express();

app.use(express.json());        

connection.authenticate();
connection.sync({alter: true})
console.log('API ON') 

app.listen(3333, () => {
    console.log('SERVIDOR ON!')
}); 


app.post('/places', async (req, res) => {

    try {
         const place = {

        name: req.body.name,
       
        numberPhone: req.body.numberPhone,
  
        openingHours: req.body.openingHours,
  
        description: req.body.description,
 
        latitude: req.body.latitude,   
    
        longitude: req.body.longitude,
      }

         const newPlace = await Place.create(place)

             res.status(201).json(newPlace)

    } catch (error) {
        res.status(400).json({message: error.message})
    }
});


app.get('/places', async (req, res) => {
    try {

        const places = await Place.findAll()
        return res.json(places) 
    } 
    catch (error) {
        res.status(500).json({message: 'Não há dados'})
    }

})


app.delete('/places/:id', async (req, res) => {
    try {
      const place = await Place.findByPk(req.params.id);
      if (!place) {
        return res.status(404).json({ message: 'Local não encontrado' });
      }
      await place.destroy();
      res.status(204).json();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


  app.put('/places/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        numberPhone,
        openingHours,
        description,
        latitude,
        longitude
      } = req.body;
   
      const place = await Place.findByPk(id);

      place.name = name;
      place.numberPhone = numberPhone;
      place.openingHours = openingHours;
      place.description = description;
      place.latitude = latitude;
      place.longitude = longitude;

      const placeUpdated = await place.save();

      return res.json(placeUpdated);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.post('/users', async (req, res) => {

    try {
         const user = {

        name: req.body.name,
       
        email: req.body.email,
  
        username: req.body.username,
  
        password: req.body.password,
 
      }

         const newUser = await User.create(user)

             res.status(201).json(newUser)

    } catch (error) {
        res.status(400).json({message: error.message})
    }
});


app.post('/sessions/:username/:password', async (req, res) => {

  const { username, password } = req.params;

  try {
    const userExists = await User.findOne({username});

    if (!userExists) {
      return res.status(404).json({message: 'Credenciais Incorretas'});
    }

    const passwordExists = await User.findOne({password})

    if (!passwordExists) {
      return res.status(400).json({message: 'Confira suas informações de acesso'});
    }


    const token = jwt.sign(

      {
        id: userExists.id,
      },
      "MINHA_CHAVE_TOKEN",
      {
        expiresIn: '1h'
      }
    )
      res.json({username: userExists.username, token: token})
      
 
    } catch (error) {
      res.status(500).json({message: 'Não foi possível processar a solicitação'});
  }


});