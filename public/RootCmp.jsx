const Router = ReactRouterDOM.BrowserRouter
const { Route, Routes } = ReactRouterDOM
const { useState } = React

import { UserMsg } from './cmps/UserMsg.jsx'
import { AppHeader } from './cmps/AppHeader.jsx'
import { AppFooter } from './cmps/AppFooter.jsx'
import { Home } from './pages/Home.jsx'
import { BugIndex } from './pages/BugIndex.jsx'
import { BugDetails } from './pages/BugDetails.jsx'
import { AboutUs } from './pages/AboutUs.jsx'
import { authService } from './services/auth.service.js'
import { LoginSignup } from './pages/LoginSignup.jsx'
import { UserDetails } from './pages/UserDetails.jsx'
import { NotFound } from './cmps/NotFound.jsx'

export function App() {
    const [loggedinUser, setLoggedinUser] = useState(authService.getLoggedinUser())
    return <Router>
        <div className="app-wrapper">
            <UserMsg />
            <AppHeader loggedinUser={loggedinUser} setLoggedinUser={setLoggedinUser} />
            <main className="container">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/bug" element={<BugIndex />} />
                    <Route path="/bug/:bugId" element={<BugDetails />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/auth" element={<LoginSignup setLoggedinUser={setLoggedinUser} />} />
                    <Route path="/user/:userId" element={<UserDetails />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            <AppFooter />
        </div>
    </Router>
}
