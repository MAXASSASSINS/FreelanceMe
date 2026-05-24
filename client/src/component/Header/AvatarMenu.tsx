import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../../actions/userAction";
import { useSocket } from "../../context/socketContext";
import { AppDispatch, RootState } from "../../store";
import { setRedirectUrl } from "../../utility/util";

const AvatarMenu = () => {
  const dispatch = useDispatch<AppDispatch>();
  const socket = useSocket();
  const navigate = useNavigate();
  const {user, userError} = useSelector((state: RootState) => state.user);

  const handleLogOut = async () => {
    await dispatch(logoutUser());
    console.log('initiating socket disconnect');
    socket.disconnect();
    console.log('socket disconnected');
    if (!userError){
      navigate("/");
      setRedirectUrl("/");
    } 
  };

  return (
    <div className="absolute z-50 text-light_heading min-w-max right-0 top-10 px-4 py-3 rounded bg-separator shadow-lg leading-5">
      <ul className="hover:[&>*]:underline flex flex-col gap-4">
        <Link to={"/user/" + user?._id}>Profile</Link>

        <Link to={"/my/favourite/gigs"}>Favourite Gigs</Link>

        <Link to={"/get/all/messages/for/current/user"}>Inbox</Link>

        <Link to={"/orders"}>Orders</Link>
        <li onClick={handleLogOut} className="hover:cursor-pointer">
          Logout
        </li>
      </ul>
    </div>
  );
};

export default AvatarMenu;
