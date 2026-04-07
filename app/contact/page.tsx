'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Thank you! Your message has been sent.');
    reset();
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      content: '+91 98765 43210',
      description: 'Order Hotline (24/7)'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'info@biryaniadda.com',
      description: 'Customer Support'
    },
    {
      icon: MapPin,
      title: 'Address',
      content: '123 Food Street, Bhiwandi',
      description: 'Maharashtra 421302'
    },
    {
      icon: Clock,
      title: 'Hours',
      content: '11:00 AM - 11:00 PM',
      description: 'Monday - Sunday'
    }
  ];

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/8753462/pexels-photo-8753462.jpeg)',
          }}
        />
        <div className="absolute inset-0 bg-black/70 z-10" />
        
        <div className="container mx-auto px-4 z-20 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Contact <span className="text-orange-500">Us</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Have a question or want to place a special order? We're here to help!
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
              <p className="text-gray-400 text-lg">
                We'd love to hear from you! Whether you have questions about our menu, 
                want to place a bulk order, or just want to share your feedback.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="bg-gray-800 border-gray-700 h-full">
                    <CardContent className="p-6 text-center">
                      <info.icon className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                      <h3 className="font-semibold text-white mb-2">{info.title}</h3>
                      <p className="text-orange-400 font-semibold mb-1">{info.content}</p>
                      <p className="text-gray-400 text-sm">{info.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Map Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800 rounded-lg p-8 text-center"
            >
              <MapPin className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Visit Our Location</h3>
              <p className="text-gray-400 mb-4">
                Come visit us at our restaurant to experience the authentic taste of biryani in a warm, welcoming atmosphere.
              </p>
              <Button className="bg-orange-500 hover:bg-orange-600">
                Get Directions
              </Button>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-gray-300">Name</Label>
                      <Input
                        id="name"
                        {...register('name', { required: true })}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                      <Input
                        id="phone"
                        {...register('phone', { required: true })}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email', { required: true })}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Your email address"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-gray-300">Message</Label>
                    <Textarea
                      id="message"
                      {...register('message', { required: true })}
                      rows={5}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-lg py-3"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;