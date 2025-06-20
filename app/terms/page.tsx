"use client"

import Head from 'next/head';
import { useState } from 'react';

export default function TermsAndConditions() {
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
        <title>Terms and Conditions - KALIAN LLC</title>
        <meta name="description" content="Terms and Conditions for KALIAN LLC - Learn about the terms of use for our services and website." />
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
                  onClick={() => handleScrollToSection('agreement')}
                  className="hover:text-blue-200 transition-colors duration-200"
                >
                  Agreement
                </button>
                <button 
                  onClick={() => handleScrollToSection('services')}
                  className="hover:text-blue-200 transition-colors duration-200"
                >
                  Services
                </button>
                <button 
                  onClick={() => handleScrollToSection('userrights')}
                  className="hover:text-blue-200 transition-colors duration-200"
                >
                  User Rights
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
            <h1 className="text-5xl font-bold text-gray-800 mb-4">TERMS AND CONDITIONS</h1>
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
                    { id: 'agreement', title: '1. Agreement to Our Terms' },
                    { id: 'acceptance', title: '2. Acceptance of Terms' },
                    { id: 'services', title: '3. Our Services' },
                    { id: 'registration', title: '4. User Registration' },
                    { id: 'userrights', title: '5. User Rights and Responsibilities' },
                    { id: 'prohibited', title: '6. Prohibited Uses' },
                    { id: 'content', title: '7. User Generated Content' },
                    { id: 'privacy', title: '8. Privacy Policy' },
                    { id: 'termination', title: '9. Account Termination' },
                    { id: 'disclaimers', title: '10. Disclaimers' },
                    { id: 'liability', title: '11. Limitation of Liability' },
                    { id: 'indemnification', title: '12. Indemnification' },
                    { id: 'governing', title: '13. Governing Law' },
                    { id: 'disputes', title: '14. Dispute Resolution' },
                    { id: 'corrections', title: '15. Corrections' },
                    { id: 'disclaimer', title: '16. Disclaimer' },
                    { id: 'contact', title: '17. Contact Information' }
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
                    These Terms and Conditions ("Terms", "Terms and Conditions") govern your relationship with 
                    <strong> KALIAN LLC</strong> website (the "Service") operated by <strong>KALIAN LLC</strong> ("us", "we", or "our").
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Please read these Terms and Conditions carefully before using our Service. Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users and others who access or use the Service.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-gray-700">
                      <strong>By accessing or using our Service you agree to be bound by these Terms.</strong> If you disagree with any part of these terms then you may not access the Service.
                    </p>
                  </div>
                </section>

                {/* Agreement Section */}
                <section id="agreement" className="mb-12 scroll-mt-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                    1. AGREEMENT TO OUR TERMS
                  </h2>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and <strong>KALIAN LLC</strong> ("Company," "we," "us," or "our"), concerning your access to and use of the website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
                    </p>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-red-800 mb-3">Important Notice</h3>
                      <p className="text-gray-700">
                        You agree that by accessing the Site, you have read, understood, and agreed to be bound by all of these Terms of Use. IF YOU DO NOT AGREE WITH ALL OF THESE TERMS OF USE, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY.
                      </p>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed">
                      Supplemental terms and conditions or documents that may be posted on the Site from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Terms of Use from time to time.
                    </p>
                  </div>
                </section>

                {/* Acceptance Section */}
                <section id="acceptance" className="mb-12 scroll-mt-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                    2. ACCEPTANCE OF TERMS
                  </h2>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      The information provided on the Site is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country.
                    </p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-800 mb-3">Age Requirements</h3>
                      <p className="text-gray-700">
                        The Site is intended for users who are at least 18 years old. Persons under the age of 18 are not permitted to use or register for the Site.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Our Services Section */}
                <section id="services" className="mb-12 scroll-mt-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                    3. OUR SERVICES
                  </h2>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      The information provided when using the Service is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country.
                    </p>
                    
                    <div className="grid gap-4">
                      {[
                        {
                          title: "Service Availability",
                          content: "We reserve the right to withdraw or amend our Service, and any service or material we provide on the Service, in our sole discretion without notice."
                        },
                        {
                          title: "Technical Requirements",
                          content: "You are responsible for ensuring that all persons who access our Service through your internet connection are aware of these Terms of Use and comply with them."
                        },
                        {
                          title: "Service Modifications",
                          content: "We may update the content on this Service from time to time, but its content is not necessarily complete or up-to-date."
                        }
                      ].map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-6 border-l-4 border-green-500">
                          <h3 className="font-semibold text-gray-800 mb-3">{item.title}</h3>
                          <p className="text-gray-700 leading-relaxed">{item.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* User Registration Section */}
                <section id="registration" className="mb-12 scroll-mt-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                    4. USER REGISTRATION
                  </h2>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      You may be required to register with the Site. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
                    </p>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-orange-800 mb-3">Account Security</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          You are responsible for safeguarding the password and for any activities under your account
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          You must notify us immediately upon becoming aware of any breach of security
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          You may not use another user's account without permission
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* User Rights Section */}
                <section id="userrights" className="mb-12 scroll-mt-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                    5. USER RIGHTS AND RESPONSIBILITIES
                  </h2>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-green-800 mb-3">Your Rights</h3>
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Access and use our services as intended
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Receive customer support when available
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Privacy protection as outlined in our Privacy Policy
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Request account deletion or modification
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-800 mb-3">Your Responsibilities</h3>
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Provide accurate and complete information
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Maintain the security of your account
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Comply with applicable laws and these Terms
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Respect other users and our staff
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Prohibited Uses Section */}
                <section id="prohibited" className="mb-12 scroll-mt-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                    6. PROHIBITED USES
                  </h2>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      You may not use our Service for any unlawful purpose or to solicit others to perform or participate in any unlawful acts. You may not violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances.
                    </p>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-red-800 mb-3">Strictly Prohibited Activities</h3>
                      <ul className="grid md:grid-cols-2 gap-2 text-gray-700">
                        {[
                          'Violate any applicable law or regulation',
                          'Transmit any harassing, abusive, or threatening content',
                          'Attempt to bypass our security measures',
                          'Upload viruses or malicious code',
                          'Collect user information without consent',
                          'Use our service for spam or unsolicited marketing',
                          'Impersonate another person or entity',
                          'Interfere with or disrupt our services'
                        ].map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                {/* User Generated Content Section */}
                <section id="content" className="mb-12 scroll-mt-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                    7. USER GENERATED CONTENT
                  </h2>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      The Service may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Service.
                    </p>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-800 mb-3">Content Guidelines</h3>
                      <p className="text-gray-700 mb-3">
                        By posting content to any part of the Service, you automatically grant, and you represent and warrant that you have the right to grant, to us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right.
                      </p>
                      <p className="text-gray-700">
                        You are solely responsible for your content and the consequences of submitting and publishing your content on the Service.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Privacy Policy Section */}
                <section id="privacy" className="mb-12 scroll-mt-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                    8. PRIVACY POLICY
                  </h2>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      We care about data privacy and security. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
                    </p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-800 mb-3">Data Protection</h3>
                      <p className="text-gray-700">
                        By using our Service, you agree to the collection and use of information in accordance with our Privacy Policy. Our Privacy Policy describes how we collect, use, and share information when you use our services.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Account Termination Section */}
                <section id="termination" className="mb-12 scroll-mt-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                    9. ACCOUNT TERMINATION
                  </h2>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                    
                    <div className="grid gap-4">
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-orange-800 mb-3">Termination by Us</h3>
                        <p className="text-gray-700">
                          Upon termination, your right to use the Service will cease immediately. If you wish to terminate your account, you may simply discontinue using the Service.
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Effect of Termination</h3>
                        <p className="text-gray-700">
                          All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Disclaimers Section */}
                <section id="disclaimers" className="mb-12 scroll-mt-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                    10. DISCLAIMERS
                  </h2>
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <p className="text-gray-700 leading-relaxed">
                        The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms whether express or implied, statutory or otherwise.
                      </p>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed">
                      The Service is provided to you "AS IS" and "AS AVAILABLE" and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own behalf and on behalf of its Affiliates and its and their respective licensors and service providers, expressly disclaims all warranties.
                    </p>
                  </div>
                </section>

                {/* Limitation of Liability Section */}
                <section id="liability" className="mb-12 scroll-mt-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                    11. LIMITATION OF LIABILITY
                  </h2>
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <p className="text-gray-700 leading-relaxed">
                        In no event shall <strong>KALIAN LLC</strong>, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
                      </p>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed">
                      Despite anything to the contrary contained herein, our liability to you for any cause whatsoever and regardless of the form of the action, will at all times be limited to the amount paid, if any, by you to us during the six (6) month period prior to any cause of action arising.
                    </p>
                  </div>
                </section>

                {/* Indemnification Section */}
                <section id="indemnification" className="mb-12 scroll-mt-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                    12. INDEMNIFICATION
                  </h2>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      You agree to defend, indemnify, and hold harmless the Company and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees).
                    </p>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-red-800 mb-3">Your Responsibility</h3>
                      <p className="text-gray-700">
                        This includes claims resulting from: (a) your use and access of the Service; (b) your violation of any provision of these Terms; (c) your violation of any third party right, including without limitation any copyright, property, or privacy right; or (d) any claim that your content caused damage to a third party.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Governing Law Section */}
                <section id="governing" className="mb-12 scroll-mt-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                    13. GOVERNING LAW
                  </h2>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      These Terms shall be interpreted and enforced in accordance with the laws of the State of Wyoming, United States, without regard to conflict of law provisions.
                    </p>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Jurisdiction</h3>
                      <p className="text-gray-700">
                        Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Dispute Resolution Section */}
                <section id="disputes" className="mb-12 scroll-mt-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                    14. DISPUTE RESOLUTION
                  </h2>
                  <div className="space-y-6">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-800 mb-3">Informal Resolution</h3>
                      <p className="text-gray-700 mb-3">
                        To expedite resolution and control the cost of any dispute, controversy, or claim related to these Terms, you and we agree to first attempt to negotiate any dispute informally for at least thirty (30) days before initiating arbitration.
                      </p>
                      <p className="text-gray-700">
                        Such informal negotiations commence upon written notice from one party to the other party.
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-800 mb-3">Binding Arbitration</h3>
                      <p className="text-gray-700">
                        Any dispute arising out of or in connection with this contract, including any question regarding its existence, validity, or termination, shall be referred to and finally resolved by the International Commercial Arbitration Court under the Rules of Arbitration of the International Chamber of Commerce.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Corrections Section */}
                <section id="corrections" className="mb-12 scroll-mt-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                    15. CORRECTIONS
                  </h2>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      There may be information on the Service that contains typographical errors, inaccuracies, or omissions, including descriptions, pricing, availability, and various other information. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the Service at any time, without prior notice.
                    </p>
                  </div>
                </section>

                {/* Disclaimer Section */}
                <section id="disclaimer" className="mb-12 scroll-mt-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-3">
                    16. DISCLAIMER
                  </h2>
                  <div className="space-y-6">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <p className="text-gray-700 leading-relaxed">
                        The Service is provided to you "AS IS" and "AS AVAILABLE" and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own behalf and on behalf of its Affiliates and its and their respective licensors and service providers, expressly disclaims all warranties, whether express, implied, statutory, or otherwise.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="mb-12 scroll-mt-8">
                </section>
                <section id="contact" className="mb-12 scroll-mt-8">
                  
                </section>

                {/* Final Notice */}
                <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">Acknowledgment</h3>
                  <p className="text-gray-700">
                    BY USING OUR SERVICE OR OTHER SERVICES PROVIDED BY US, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE AND AGREE TO BE BOUND BY THEM.
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