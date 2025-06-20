"use client"

import Head from 'next/head';
import { useState } from 'react';

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('');

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  return (
    <>
      <Head>
        <title>Privacy Policy - KALIAN LLC</title>
        <meta name="description" content="Privacy Policy for KALIAN LLC - Learn about how we collect, use, and protect your personal information." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="logo">
                <h1 className="text-3xl font-bold tracking-wide">KALIAN LLC</h1>
              </div>
              <nav className="hidden md:flex space-x-6">
                <button 
                  onClick={() => handleScrollToSection('summary')}
                  className="hover:text-blue-200 transition-colors duration-200"
                >
                  Summary
                </button>
                <button 
                  onClick={() => handleScrollToSection('infocollect')}
                  className="hover:text-blue-200 transition-colors duration-200"
                >
                  Information
                </button>
                <button 
                  onClick={() => handleScrollToSection('privacyrights')}
                  className="hover:text-blue-200 transition-colors duration-200"
                >
                  Rights
                </button>
                <button 
                  onClick={() => handleScrollToSection('contact')}
                  className="hover:text-blue-200 transition-colors duration-200"
                >
                  Contact
                </button>
              </nav>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">PRIVACY POLICY</h1>
            <p className="text-lg text-gray-600 italic">Last updated June 05, 2026</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-1/4">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                <h3 className="text-xl font-semibold text-blue-600 mb-4 border-b-2 border-gray-200 pb-2">
                  Table of Contents
                </h3>
                <ul className="space-y-2">
                  {[
                    { id: 'summary', title: 'Summary of Key Points' },
                    { id: 'infocollect', title: '1. What Information Do We Collect?' },
                    { id: 'infouse', title: '2. How Do We Process Your Information?' },
                    { id: 'legalbases', title: '3. Legal Bases' },
                    { id: 'whoshare', title: '4. When Do We Share Information?' },
                    { id: 'sociallogins', title: '5. Social Logins' },
                    { id: 'inforetain', title: '6. How Long Do We Keep Information?' },
                    { id: 'infosafe', title: '7. How Do We Keep Information Safe?' },
                    { id: 'infominors', title: '8. Information from Minors' },
                    { id: 'privacyrights', title: '9. Your Privacy Rights' },
                    { id: 'DNT', title: '10. Do-Not-Track' },
                    { id: 'uslaws', title: '11. US Residents Rights' },
                    { id: 'policyupdates', title: '12. Policy Updates' },
                    { id: 'contact', title: '13. Contact Us' },
                    { id: 'request', title: '14. Review, Update, Delete Data' }
                  ].map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => handleScrollToSection(item.id)}
                        className={`text-left w-full p-2 rounded-lg transition-all duration-200 text-sm hover:bg-blue-50 hover:text-blue-600 hover:pl-4 ${
                          activeSection === item.id ? 'bg-blue-50 text-blue-600 pl-4' : 'text-gray-700'
                        }`}
                      >
                        {item.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:w-3/4">
              <div className="bg-white rounded-xl shadow-lg p-8">
                {/* Introduction */}
                <section className="mb-12 bg-gradient-to-r from-blue-50 to-gray-50 rounded-lg p-6 border-l-4 border-blue-500">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    This Privacy Notice for <strong>KALIAN LLC</strong> ("we," "us," or "our"), 
                    describes how and why we might access, collect, store, use, and/or share ("process") 
                    your personal information when you use our services ("Services"), including when you:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                    <li>Visit our website at <a href="https://optimizadorbo.com" target="_blank" className="text-blue-600 hover:text-blue-800 underline">https://optimizadorbo.com</a> or any website of ours that links to this Privacy Notice</li>
                    <li>Engage with us in other related ways, including any sales, marketing, or events</li>
                  </ul>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-gray-700">
                      <strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy rights and choices. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at <a href="mailto:tratikplay.store@gmail.com" className="text-blue-600 hover:text-blue-800 underline">tratikplay.store@gmail.com</a>.
                    </p>
                  </div>
                </section>

                {/* Summary Section */}
                <section id="summary" className="mb-12 scroll-mt-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                    SUMMARY OF KEY POINTS
                  </h2>
                  <p className="text-gray-600 italic mb-6">
                    This summary provides key points from our Privacy Notice, but you can find out more details about any of these topics by using our table of contents to find the section you are looking for.
                  </p>
                  
                  <div className="grid gap-6">
                    {[
                      {
                        title: "What personal information do we process?",
                        content: "When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use."
                      },
                      {
                        title: "Do we process any sensitive personal information?",
                        content: "Some of the information may be considered \"special\" or \"sensitive\" in certain jurisdictions. We do not process sensitive personal information."
                      },
                      {
                        title: "Do we collect any information from third parties?",
                        content: "We do not collect any information from third parties."
                      },
                      {
                        title: "How do we process your information?",
                        content: "We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law."
                      },
                      {
                        title: "How do we keep your information safe?",
                        content: "We have adequate organizational and technical processes and procedures in place to protect your personal information."
                      }
                    ].map((point, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500">
                        <h3 className="font-semibold text-gray-800 mb-3">{point.title}</h3>
                        <p className="text-gray-700 leading-relaxed">{point.content}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Information Collection Section */}
                <section id="infocollect" className="mb-12 scroll-mt-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                    1. WHAT INFORMATION DO WE COLLECT?
                  </h2>
                  
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-blue-600 mb-4">Personal information you disclose to us</h3>
                    <p className="text-gray-700 mb-4">
                      <strong><em>In Short:</em></strong> <em>We collect personal information that you provide to us.</em>
                    </p>
                    
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.
                    </p>
                    
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Personal Information Provided by You</h4>
                    <p className="text-gray-700 mb-4">
                      The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:
                    </p>
                    
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                      {['Names', 'Phone numbers', 'Email addresses', 'Usernames', 'Passwords', 'Debit/credit card numbers', 'Billing addresses'].map((item, index) => (
                        <li key={index} className="flex items-center text-gray-700">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    
                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-blue-800 mb-3">Payment Data</h4>
                        <p className="text-gray-700">
                          We may collect data necessary to process your payment if you choose to make purchases, such as your payment instrument number, and the security code associated with your payment instrument. All payment data is handled and stored by <strong>red enlace</strong>. You may find their privacy notice at: <a href="https://www.redenlace.com.bo/politicas-de-privacidad" className="text-blue-600 hover:text-blue-800 underline" target="_blank">https://www.redenlace.com.bo/politicas-de-privacidad</a>
                        </p>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-green-800 mb-3">Social Media Login Data</h4>
                        <p className="text-gray-700">
                          We may provide you with the option to register with us using your existing social media account details, like your Facebook, X, or other social media account. If you choose to register in this way, we will collect certain profile information about you from the social media provider.
                        </p>
                      </div>
                      
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-purple-800 mb-3">Google API</h4>
                        <p className="text-gray-700">
                          Our use of information received from Google APIs will adhere to <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-blue-600 hover:text-blue-800 underline" target="_blank">Google API Services User Data Policy</a>, including the <a href="https://developers.google.com/terms/api-services-user-data-policy#limited-use" className="text-blue-600 hover:text-blue-800 underline" target="_blank">Limited Use requirements</a>.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Information Processing Section */}
                <section id="infouse" className="mb-12 scroll-mt-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                    2. HOW DO WE PROCESS YOUR INFORMATION?
                  </h2>
                  <p className="text-gray-700 mb-6">
                    <strong><em>In Short:</em></strong> <em>We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.</em>
                  </p>
                  
                  <p className="text-gray-700 mb-4 font-semibold">
                    We process your personal information for a variety of reasons, depending on how you interact with our Services, including:
                  </p>
                  
                  <ul className="space-y-4">
                    {[
                      {
                        title: "To facilitate account creation and authentication",
                        description: "and otherwise manage user accounts."
                      },
                      {
                        title: "To deliver and facilitate delivery of services to the user.",
                        description: "We may process your information to provide you with the requested service."
                      },
                      {
                        title: "To fulfill and manage your orders.",
                        description: "We may process your information to fulfill and manage your orders, payments, returns, and exchanges made through the Services."
                      },
                      {
                        title: "To save or protect an individual's vital interest.",
                        description: "We may process your information when necessary to save or protect an individual's vital interest, such as to prevent harm."
                      }
                    ].map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-3 h-3 bg-blue-500 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                        <div>
                          <strong className="text-gray-800">{item.title}</strong>
                          <span className="text-gray-700"> {item.description}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Privacy Rights Section */}
                <section id="privacyrights" className="mb-12 scroll-mt-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                    9. WHAT ARE YOUR PRIVACY RIGHTS?
                  </h2>
                  <p className="text-gray-700 mb-6">
                    <strong><em>In Short:</em></strong> <em>Depending on your state of residence in the US or in some regions, such as the European Economic Area (EEA), United Kingdom (UK), Switzerland, and Canada, you have rights that allow you greater access to and control over your personal information.</em>
                  </p>
                  
                  <p className="text-gray-700 mb-6">
                    In some regions (like the EEA, UK, Switzerland, and Canada), you have certain rights under applicable data protection laws. These may include the right:
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    {[
                      "(i) to request access and obtain a copy of your personal information",
                      "(ii) to request rectification or erasure",
                      "(iii) to restrict the processing of your personal information", 
                      "(iv) if applicable, to data portability",
                      "(v) not to be subject to automated decision-making"
                    ].map((right, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        <span className="text-gray-700">{right}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="space-y-6">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-orange-800 mb-3">Withdrawing your consent</h3>
                      <p className="text-gray-700">
                        If we are relying on your consent to process your personal information, you have the right to withdraw your consent at any time. You can withdraw your consent at any time by contacting us using the contact details provided below.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Account Information</h3>
                      <p className="text-gray-700 mb-3">
                        If you would at any time like to review or change the information in your account or terminate your account, you can:
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center text-gray-700">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                          Contact us using the contact information provided
                        </li>
                        <li className="flex items-center text-gray-700">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                          Call us at +59178311986
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="mb-12 scroll-mt-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                    13. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
                  </h2>
                  <p className="text-gray-700 mb-6">
                    If you have questions or comments about this notice, you may email us at <a href="mailto:optimzadorbo@gmail.com" className="text-blue-600 hover:text-blue-800 underline">optimzadorbo@gmail.com</a> or contact us by post at:
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <address className="not-italic text-gray-700 leading-relaxed">
                      <strong className="text-gray-800 block mb-2">KALIAN LLC</strong>
                      OnTruck Solutions LLC<br />
                      30 N Gould St<br />
                      Sheridan, WY 82801<br />
                      United States
                    </address>
                  </div>
                </section>

                {/* Data Request Section */}
                <section id="request" className="scroll-mt-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                    14. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?
                  </h2>
                  <p className="text-gray-700">
                    You have the right to request access to the personal information we collect from you, details about how we have processed it, correct inaccuracies, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law. To request to review, update, or delete your personal information, please fill out and submit a <a href="https://app.termly.io/notify/f70b86a0-4a49-46dc-8986-aef005d92636" target="_blank" className="text-blue-600 hover:text-blue-800 underline">data subject access request</a>.
                  </p>
                </section>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}