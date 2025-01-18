import {useContext, useState} from "react";
import {UserContext} from "../UserContext";
import {useNavigate} from "react-router-dom";
import "./styles/LoginRegisterPage.css"


export default function RegistrationForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const {login} = useContext(UserContext)
    const navigate = useNavigate()

    function handleClickNext(){
        const emailRegex = /^[^\s@]+@[^\s@]/

        if (!emailRegex.test(email)){
            document.getElementById("loginStatus").innerText= "почта не подходит под формат"
        } else if(password.length < 3){
            document.getElementById("passwordStatus").innerText = "пароль не подходит под формат"
        } else{
            sendRegistration(email, password)
            document.getElementById("loginStatus").innerText = ""
            document.getElementById("passwordStatus").innerText = ""
        }
    }

    function handleClickBack(){
        navigate("/");
    }

    function sendRegistration(email, password){
        const isLogin = false
        return fetch('/api/main/registration', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password, isLogin}),
        })
            .then(
                response => response.json()
            )
            .then(json => {
                console.log(json)
                if (json.login) {
                    login(json)
                    navigate("/main")
                } else {
                    document.getElementById("loginStatus").innerText = "данный аккаунт уже зарегистрирован"
                }
            })
    }

    return(<div className="register-form">
        <button className="BackButton" onClick={handleClickBack}>Вернуться</button>
        <h2>Регистрация</h2>
        <input id="email"
               type="email"
               placeholder="Email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}/>
        <input id="password"
               type="password"
               placeholder="Password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}/>
        <button className="RegisterButton" onClick={handleClickNext}>Зарегистрироваться</button>
        <div>
            <h4 id="loginStatus"> </h4>
            <h4 id="passwordStatus"> </h4>
        </div>
    </div>)
}
