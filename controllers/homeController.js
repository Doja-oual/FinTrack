class HomeController{

  index(res,req){
    if(req.session && req.session.user){
      return res.redirect('/dashbord');
    }

    res.render('home',{
      title:'Accueil-FinSolution'

    });
  }

}

module.exports = new HomeController;
