import { useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckIcon, ArrowRightIcon, FileTextIcon, UsersIcon, LineChartIcon, DollarSignIcon, LayersIcon } from 'lucide-react';

export default function Landing() {
  useEffect(() => {
    document.title = 'InvoiceFlow - Modern Invoice Generator';
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="text-primary-600 font-bold text-xl">InvoiceFlow</div>
            </div>
            <div>
              <a href="/api/login">
                <Button>Sign In</Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                Create Professional <span className="text-primary-600">Invoices</span> in Minutes
              </h1>
              <p className="mt-6 text-lg text-gray-500">
                Simplify your invoicing process with our powerful, easy-to-use platform designed for businesses, freelancers, and service providers.
              </p>
              <div className="mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <a href="/api/login">
                    <Button size="lg" className="w-full px-8">
                      Get Started Free
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-12 lg:mt-0 lg:col-span-6">
              <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                <img
                  className="w-full"
                  src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1000"
                  alt="Invoice dashboard preview"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              All the features you need
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
              Our comprehensive invoicing solution helps you manage your finances with ease.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600 mb-4">
                  <FileTextIcon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Invoice Generation</h3>
                <p className="mt-2 text-base text-gray-500">
                  Create professional invoices with customizable templates, automatic calculations, and PDF export.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600 mb-4">
                  <UsersIcon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Client Management</h3>
                <p className="mt-2 text-base text-gray-500">
                  Easily add, edit, and manage clients with complete contact information and transaction history.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600 mb-4">
                  <LineChartIcon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Financial Insights</h3>
                <p className="mt-2 text-base text-gray-500">
                  Gain valuable insights with P&L reports, revenue tracking, and expense management.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600 mb-4">
                  <DollarSignIcon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Multi-Currency Support</h3>
                <p className="mt-2 text-base text-gray-500">
                  Work with clients worldwide using our comprehensive multi-currency support.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600 mb-4">
                  <LayersIcon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Product Management</h3>
                <p className="mt-2 text-base text-gray-500">
                  Maintain a catalog of your products/services with pricing info for quick invoice creation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600 mb-4">
                  <FileTextIcon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Expense Tracking</h3>
                <p className="mt-2 text-base text-gray-500">
                  Record and categorize business expenses to maintain accurate financial records.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Trusted by businesses worldwide
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
                      alt="User"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Michael Johnson</h3>
                    <p className="text-sm text-gray-500">Freelance Designer</p>
                  </div>
                </div>
                <p className="mt-2 text-base text-gray-500">
                  "InvoiceFlow has streamlined my invoicing process completely. I can create professional invoices in minutes and get paid faster than ever."
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=100"
                      alt="User"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Sarah Williams</h3>
                    <p className="text-sm text-gray-500">Agency Owner</p>
                  </div>
                </div>
                <p className="mt-2 text-base text-gray-500">
                  "The client management and financial reporting features help me keep track of my business performance at a glance. Excellent tool!"
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100"
                      alt="User"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">David Chen</h3>
                    <p className="text-sm text-gray-500">Small Business Owner</p>
                  </div>
                </div>
                <p className="mt-2 text-base text-gray-500">
                  "I've tried several invoicing solutions, but InvoiceFlow offers the perfect balance of features and simplicity. Highly recommended!"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
              Start for free and upgrade as your business grows.
            </p>
          </div>

          <div className="mt-12 sm:flex sm:justify-center">
            <div className="max-w-lg mx-auto border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-8 bg-gray-50 sm:p-10 sm:pb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Free Plan</h3>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                    $0<span className="ml-1 text-lg font-medium text-gray-500">/month</span>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    Perfect for freelancers and small businesses just getting started.
                  </p>
                </div>
              </div>
              <div className="px-6 pt-6 pb-8 bg-white sm:p-10">
                <ul className="space-y-4">
                  {[
                    'Up to 5 clients',
                    'Unlimited invoices',
                    'Basic reporting',
                    'Email support',
                  ].map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckIcon className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">{feature}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <a href="/api/login">
                    <Button className="w-full">Get Started</Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to streamline your invoicing?
            </h2>
            <p className="mt-4 text-lg text-primary-100 max-w-3xl mx-auto">
              Join thousands of satisfied customers who have simplified their invoicing process.
            </p>
            <div className="mt-8">
              <a href="/api/login">
                <Button variant="secondary" size="lg">
                  Get Started Now
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <p className="text-base text-gray-500">
                &copy; {new Date().getFullYear()} InvoiceFlow. All rights reserved.
              </p>
            </div>
            <p className="mt-8 text-base text-gray-500 md:mt-0 md:order-1">
              Privacy Policy | Terms of Service
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
