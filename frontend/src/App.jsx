import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../src/components/layout/Layout.jsx'
import HomePage from '../src/pages/HomePage.jsx';
import SignUpPage from '../src/pages/auth/SignUpPage.jsx';
import LoginPage from '../src/pages/auth/LoginPage.jsx';
import toast, { Toaster } from 'react-hot-toast';
import { axiosInstance } from './lib/axios.js';
import { useQuery } from '@tanstack/react-query';
import NotificationsPage from './pages/NotificationsPage.jsx';
import NetworkPage from './pages/NetworkPage.jsx';
import PostPage from './pages/PostPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

function App() {
  const {data: authUser, isLoading} = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        return res.data;
      } catch (err) {
        // console.log("error in usequery in app.jsx", err);
        if (err.response && err.response.status === 401){
          return null;//authuser is not found
        }
        toast.error(err.response.data.message || "Something went wrong ");
        return null;
      }
    }
  });

  if (isLoading) return <div>Loading...</div>;

  // console.log("authUser", authUser);


  return (
    <Layout>
      <Routes>
        <Route path='/'element={authUser ? <HomePage />: <Navigate to ={"/login"}/>}/>
        <Route path='/signup'element={!authUser ? <SignUpPage />: <Navigate to={"/"}/>}/>
        <Route path='/login'element={!authUser ? <LoginPage />: <Navigate to={"/"}/>}/>
        <Route path='/notifications'element={authUser ? <NotificationsPage />: <Navigate to={"/login"}/>}/>
        <Route path='/network'element={authUser ? <NetworkPage />: <Navigate to={"/login"}/>}/>
        <Route path='/post/:postId'element={authUser ? <PostPage />: <Navigate to={"/login"}/>}/>
        <Route path='/profile/:username'element={authUser ? <ProfilePage />: <Navigate to={"/login"}/>}/>
      </Routes>
      <Toaster/>
    </Layout>
  );
}

export default App;
