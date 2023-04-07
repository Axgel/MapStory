import React from "react";
// import { Menu, Transition } from '@headlessui/react';

// function classNames(...classes) {
//     return classes.filter(Boolean).join(' ')
// }

// export default function NavBar() {
//   return (
//     <div className="bg-teal-700 flex items-center justify-between flex-wrap">
//         {/* map view selection */}
//         <div className="flex content-start w-4/12">
//             {/* personal maps */}
//             {/* <div className="pl-10 p-3 ">
//                 Person
//             </div> */}
//             <img class="ml-7 p-3" src="./images/home-mushroom.svg" alt="personal"></img>
//             {/* shared maps */}
//             {/* <div className="p-3">
//                 Two People
//             </div> */}
//             <img class="p-3" src="./images/home-mushroom.svg" alt="shared"></img>
//             {/* community maps */}
//             {/* <div className="p-3">
//                 Community
//             </div> */}
//             {/* <img class="p-3" src="./images/home-mushroom.svg" alt="community"></img> */}
//             <svg className="h-8 w-8 border-solid border-2 rounded-lg" version="1.1" xmlns="http://www.w3.org/2000/svg">
//                 <title>globe</title>
//                 <path d="M16 1.25c-8.146 0-14.75 6.604-14.75 14.75s6.604 14.75 14.75 14.75c8.146 0 14.75-6.604 14.75-14.75v0c-0.010-8.142-6.608-14.74-14.749-14.75h-0.001zM16.004 29.055c-1.6-1.439-2.871-3.21-3.709-5.209l-0.036-0.096h7.501c-0.865 2.1-2.142 3.874-3.741 5.292l-0.015 0.013zM11.715 22.25c-0.535-1.635-0.867-3.519-0.918-5.474l-0.001-0.026h10.408c-0.049 1.979-0.376 3.865-0.944 5.642l0.039-0.142zM2.788 16.75h6.49c0.047 1.976 0.347 3.863 0.87 5.655l-0.039-0.155h-5.787c-0.868-1.592-1.423-3.47-1.533-5.466l-0.002-0.034zM15.996 2.946c1.662 1.487 2.971 3.333 3.809 5.419l0.035 0.098-7.682-0.037c0.864-2.174 2.172-4.010 3.823-5.467l0.015-0.013zM20.356 9.966c0.492 1.571 0.799 3.383 0.848 5.258l0.001 0.026h-10.408c0.048-1.916 0.355-3.742 0.887-5.47l-0.038 0.143zM9.278 15.25h-6.49c0.11-1.977 0.641-3.806 1.502-5.433l-0.034 0.071 5.808 0.028c-0.456 1.587-0.74 3.418-0.786 5.307l-0.001 0.027zM22.722 16.75h6.49c-0.111 2.030-0.666 3.908-1.569 5.569l0.034-0.069h-5.787c0.484-1.637 0.785-3.524 0.831-5.474l0-0.026zM22.722 15.25c-0.046-1.896-0.325-3.706-0.808-5.432l0.037 0.155 5.848 0.028c0.794 1.525 1.304 3.316 1.411 5.214l0.002 0.035zM26.909 8.497l-5.441-0.026c-0.784-2.139-1.911-3.977-3.331-5.545l0.013 0.014c3.653 0.618 6.74 2.655 8.731 5.513l0.029 0.043zM13.85 2.941c-1.396 1.54-2.516 3.36-3.262 5.363l-0.038 0.115-5.381-0.026c2.019-2.845 5.073-4.84 8.602-5.441l0.078-0.011zM5.276 23.75h5.334c0.783 2.051 1.881 3.814 3.252 5.323l-0.012-0.014c-3.547-0.602-6.557-2.542-8.548-5.272l-0.026-0.038zM18.15 29.059c1.36-1.495 2.457-3.258 3.202-5.196l0.038-0.114h5.334c-2.017 2.768-5.027 4.708-8.496 5.298l-0.078 0.011z"></path>
//             </svg>
//         </div>
//         {/* search by, search bar */}
//         <div className="flex items-center w-6/12">
//             <div>
//                 <Menu>
//                     <div className="pr-4"> 
//                         <Menu.Button className="bg-white rounded-md p-1"> 
//                             Search By 
//                         </Menu.Button>
//                     </div>
//                     <Transition
//                     enter="transition duration-100 ease-out"
//                     enterFrom="transform scale-95 opacity-0"
//                     enterTo="transform scale-100 opacity-100"
//                     leave="transition duration-75 ease-out"
//                     leaveFrom="transform scale-100 opacity-100"
//                     leaveTo="transform scale-95 opacity-0"
//                     ></Transition>
//                     <Menu.Items className="bg-teal-200 absolute right-6/12 z-10 mt-2 w-45 origin-top-right rounded-md py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
//                         <Menu.Item>
//                             {({ active }) => (
//                                 <div className={classNames(
//                                     active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
//                                     'block px-4 py-2 text-sm'
//                                 )}>
//                                 Title
//                                 </div>
//                             )}
//                         </Menu.Item>
//                         <Menu.Item>
//                             {({ active }) => (
//                                 <div className={classNames(
//                                     active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
//                                     'block px-4 py-2 text-sm'
//                                 )}>
//                                 Tags
//                                 </div>
//                             )}
//                         </Menu.Item>
//                         <Menu.Item>
//                             {({ active }) => (
//                                 <div className={classNames(
//                                     active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
//                                     'block px-4 py-2 text-sm'
//                                 )}>
//                                 User
//                                 </div>
//                             )}
//                         </Menu.Item>
//                     </Menu.Items>
//                 </Menu>    
//             </div>
//             <div className="p-3">
//                 <input 
//                     className="bg-white w-full rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-1.5"
//                     type="text" 
//                     placeholder="Search"/>
//             </div>
//         </div>
//         {/* sort by */}
//         <div className="w-2/12">
//             <Menu>
//                 <div className="mr-10"> 
//                     <Menu.Button className="bg-white block rounded-md p-1 ml-auto mr-"> 
//                         Sort By 
//                     </Menu.Button>
//                 </div>
//                 <Transition
//                 enter="transition duration-100 ease-out"
//                 enterFrom="transform scale-95 opacity-0"
//                 enterTo="transform scale-100 opacity-100"
//                 leave="transition duration-75 ease-out"
//                 leaveFrom="transform scale-100 opacity-100"
//                 leaveTo="transform scale-95 opacity-0"
//                 ></Transition>
//                 <Menu.Items className="bg-teal-200 absolute right-0 z-10 mt-2 w-45 origin-top-right rounded-md py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
//                     <Menu.Item>
//                         {({ active }) => (
//                             <div className={classNames(
//                                 active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
//                                 'block px-4 py-2 text-sm'
//                                 )}>
//                             Name
//                             </div>
//                         )}
//                     </Menu.Item>
//                     <Menu.Item>
//                         {({ active }) => (
//                             <div className={classNames(
//                                 active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
//                                 'block px-4 py-2 text-sm'
//                             )}>
//                             Upvote
//                             </div>
//                         )}
//                     </Menu.Item>
//                     <Menu.Item>
//                         {({ active }) => (
//                             <div className={classNames(
//                                 active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
//                                 'block px-4 py-2 text-sm'
//                             )}>
//                                 Downvote
//                             </div>
//                         )}
//                     </Menu.Item>
//                 </Menu.Items>
//             </Menu>
//         </div>
//     </div>
//   );
// }
