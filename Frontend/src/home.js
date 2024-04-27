import React from 'react'
import './home.css'
import logouticon from './images/logout.png'
import { callApi, errorResponse, getSession, setSession } from './main';
import menuicon from './images/menu.png'


const HS1 = {"padding-left" : "5px", "font-weigaht" : "bold"};
const HS2 = {"float" : "right", "padding-right" : "5px", "cursor" : "pointer"};
const HS3 = {"float" : "right", "height" : "16px", "margin-top" : "6px", "cursor" : "pointer"}
const HS4 = {"float" : "right", "padding-right" : "10px"}
export function loadMenu(res)
{
    var data = JSON.parse(res);
    var menuitems = "";
    menuitems += `<li>
                    <label id='homeL'>Home</label>
                  </li>`;
    for (var x in data) {
    menuitems += `<li>
                        <label id='${data[x].mid}L'>${data[x].mtitle}<i class="dropdown-icon"></i></label>
                        <div id='${data[x].mid}' class='smenu'></div>
                        </li>`;
    }
    var mlist = document.getElementById('mlist');
    mlist.innerHTML = menuitems;
    document.getElementById('homeL').addEventListener("click", loadHomeModule);
    for ( x in data) {
        var menuLabel = document.getElementById(  `${data[x].mid}L`);
        menuLabel.addEventListener("click", function (mid) {
            return function () {
                var dropdownIcon = this.querySelector('.dropdown-icon');
                dropdownIcon.classList.toggle('rotated');
                showSMenu(mid);
            };
        }(data[x].mid));
    }
}


export function loadHomeModule() {
    var titlebar = document.getElementById('titlebar');
    var module = document.getElementById('module');
 
    // Set the content for the "Home" module
    module.src = "/ahome";
    titlebar.innerText = "Home"; // Change the title to indicate the home page
    module.className = 'module-home'; // Apply a specific class for styling if needed
 }

export function showSMenu(mid){
    var surl = "http://localhost:5000/home/menus"; 
    var ipdata = JSON.stringify({
        mid : mid
    });
    // Close any open submenus with animation
    var openSubmenus = document.querySelectorAll('.smenu');
    openSubmenus.forEach(smenu => {
        if (smenu.id !== mid && smenu.classList.contains('active')) {
            smenu.style.maxHeight = '0'; // Ensure the menu is closed
            setTimeout(() => {
                smenu.classList.remove('active'); // Remove active class after closing
            }, 900); // Adjust the timeout to match transition duration

            // Reset rotation for the dropdown icon in closed submenu
            var menuLabel = document.getElementById(`${smenu.id}L`);
            if (menuLabel) {
                var dropdownIcon = menuLabel.querySelector('.dropdown-icon');
                dropdownIcon.classList.remove('rotated');
            }
        }
    });

    // Check if the clicked menu is already active
    var clickedMenu = document.getElementById(mid);
    if (clickedMenu.classList.contains('active')) {
        clickedMenu.style.maxHeight = '0'; // Close the submenu
        setTimeout(() => {
            clickedMenu.classList.remove('active'); // Remove active class after closing
        }, 900); // Adjust the timeout to match transition duration

        // Reset rotation for the dropdown icon in closed submenu
        var menuLabel = document.getElementById(`${mid}L`);
        if (menuLabel) {
            var dropdownIcon = menuLabel.querySelector('.dropdown-icon');
            dropdownIcon.classList.remove('rotated');
        }
    } else {
        // Show loading indicator while fetching submenu data
        var smenu = document.getElementById(mid);

        callApi("POST", surl, ipdata, function(res) {
            loadSMenu(res);
            // After loading submenu data, open the submenu with animation
            setTimeout(() => {
                smenu.style.maxHeight = smenu.scrollHeight + 'px'; // Set max-height to show the menu
                smenu.classList.add('active'); // Add active class after opening

                // Rotate the dropdown icon for the opened submenu
                var menuLabel = document.getElementById(`${mid}L`);
                if (menuLabel) {
                    var dropdownIcon = menuLabel.querySelector('.dropdown-icon');
                    dropdownIcon.classList.add('rotated');
                }
            }, 100); // Add a small delay before adjusting max-height
        }, errorResponse);
    }
}


export function loadSMenu(res)
{
    var data = JSON.parse(res);
    var smenuitems = "";
    for(var x in data)
    {
        smenuitems += `<label id='${data[x].smid}'>${data[x].smtitle}</label>`;
    }
    var smenu = document.getElementById(`${data[x].mid}`);
    smenu.innerHTML = smenuitems;

    for(x in data)
    {
        document.getElementById(`${data[x].smid}`).addEventListener("click", loadModule.bind(null, data[x].smid));
    }
}

export function loadModule(smid)
{
   var titlebar = document.getElementById('titlebar');
   var module = document.getElementById('module');
   switch(smid)
   {
        case "M00101":
            module.src = "/todo";
            titlebar.innerText = "To Do Tasks";
            break;
        case "M00102":
            module.src = "/doing";
            titlebar.innerText = "Doing Tasks";
            break;
        case "M00103":
            module.src = "/done";
            titlebar.innerText = "Done Tasks";
            break;
        case "M10101":
            module.src = "/myprofile";
            titlebar.innerText = "My Profile";
            break;
        case "M10102":
            module.src = "/changepassword";
            titlebar.innerText = "Change Password";
            break;
        case "M00104":
            module.src = "/alltasks";
            titlebar.innerText = "All Tasks";
            break;
        default:
            module.src = "";
            titlebar.innerText = "";
   }
}

class Home extends React.Component
{
    constructor()
    {
        super();
        this.sid = getSession("sid");
        //alert(this.sid);
        if(this.sid === "")
            window.location.replace("/");

        var url = "http://localhost:5000/home/uname";
        var data = JSON.stringify({
            emailid : this.sid
        });
        callApi("POST", url, data, this.loadUname, errorResponse);

        url = "http://localhost:5000/home/menu";
        callApi("POST", url, "", loadMenu, errorResponse);
    }

    loadUname(res)
    {
        var data = JSON.parse(res);
        var HL1 = document.getElementById("HL1");
        HL1.innerText = `${data[0].firstname} ${data[0].lastname}`
    }

    logout()
    {
        setSession("sid", "", -1);
        window.location.replace("/");
    }

    render()
    {
        return(
            <div className='full-height'>
                <div className='header1'>
                    <label style={HS1}>Task Management System </label>
                    <label style={HS2} onClick={this.logout}>Logout</label>
                    <img src={logouticon} alt='' style={HS3} onClick={this.logout} />
                    <label id='HL1' style={HS4}></label>
                </div>
                <div className='content'>
                    <div className='menubar'>
                        <div className='menuheader1'>
                            <img src={menuicon} alt='' />
                            <label>MENU</label>
                        </div>
                        <div className='menu'>
                            <nav><ul id='mlist' className='mlist'></ul></nav>
                        </div>
                    </div>
                    <div className='outlet'>
                        <div id='titlebar'></div>
                        <iframe id='module' src="" ></iframe>
                    </div>
                </div>
                <div className='footer1'>
                    Copyright &#169; Task Management System. All rights reserved.
                </div>
            </div>
        );
    }
}

export default Home;