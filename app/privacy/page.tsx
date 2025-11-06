import { Card, CardBody } from '@nextui-org/react'

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-foreground/60">
            Last updated: November 2024
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <Card>
            <CardBody className="p-6 md:p-8">
              <h2 className="text-2xl font-semibold mb-4">Our Commitment</h2>
              <p className="text-foreground/80 leading-relaxed">
                PoliGrade does not collect personal data for analytics or advertising purposes.
                We do not use cookies for tracking. We do not sell or share your data.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6 md:p-8">
              <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
              <p className="text-foreground/80 leading-relaxed">
                We only use cookies to save your quiz progress as you complete the political alignment quiz.
                No tracking or analytics cookies are used.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6 md:p-8">
              <h2 className="text-2xl font-semibold mb-4">Contact Form</h2>
              <p className="text-foreground/80 leading-relaxed">
                When you submit our contact form, your message is sent directly to our email via Web3Forms.
                We only use this information to respond to your inquiry.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6 md:p-8">
              <h2 className="text-2xl font-semibold mb-4">Questions</h2>
              <p className="text-foreground/80 leading-relaxed">
                If you have any questions about this privacy policy, please{' '}
                <a href="/contact" className="text-primary hover:underline">
                  contact us
                </a>
                .
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
