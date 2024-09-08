import Image from 'next/image'
import GetInForm from '@/components/GetInForm'


export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <main className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 mb-12 lg:mb-0">
            <h1 className="text-5xl font-bold mb-6">Welcome to ABC Blockchain Club</h1>
            <p className="text-xl mb-8">
              Join our community of builders, innovators, and blockchain enthusiasts. 
              Earn ABCr points, complete tasks, and grow your skills!
            </p>
            <div className="flex space-x-4">
              <a href="#about" className="btn-primary">Learn More</a>
              <a href="#get-in" className="btn-secondary">Get In</a>
            </div>
          </div>
          <div className="lg:w-1/2">
            <Image
              src="/blockchain-illustration.svg"
              alt="Blockchain Illustration"
              width={500}
              height={500}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>

        <section id="about" className="my-24">
          <h2 className="text-3xl font-bold mb-8">About ABC Blockchain Club</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Learn</h3>
              <p>Access cutting-edge blockchain courses and workshops.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Build</h3>
              <p>Participate in hackathons and collaborative projects.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Connect</h3>
              <p>Network with industry professionals and like-minded peers.</p>
            </div>
          </div>
        </section>

        <section id="get-in" className="my-24">
          <h2 className="text-3xl font-bold mb-8">Get In</h2>
          <div className="max-w-md mx-auto">
            <GetInForm />
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-center py-8">
        <p>&copy; 2024 ABC Blockchain Club. All rights reserved.</p>
      </footer>
    </div>
  )
}