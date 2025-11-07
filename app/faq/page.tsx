'use client'

import { Accordion, AccordionItem } from '@nextui-org/react'

// Source pill component similar to ChatGPT citations
function SourcePill({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50 transition-colors no-underline"
    >
      {children}
    </a>
  )
}

export default function FAQPage() {
  const faqData = [
    {
      question: 'What is PoliGrade?',
      answer: 'PoliGrade is a platform that grades elected officials and candidates into six political categories—Progressive, Liberal, Centrist, Moderate, Conservative, and Nationalist—based on ten key criteria: Economic Policy, Business & Labor, Health Care, Education, Environment, Civil Rights, Voting Rights, Immigration & Foreign Affairs, Public Safety, and Messaging.',
    },
    {
      question: 'Why did you create PoliGrade?',
      answer: (
        <>
          <p className="mb-4">
            Despite having more access to information than at any point in history, voters continue to make decisions that defy logic. Most Americans now get their political news from social media or television, both of which are deeply compromised. Social media is flooded with bots—many funded by foreign entities—whose sole purpose is to spread lies and encourage division
            <SourcePill href="https://www.csis.org/analysis/russian-bot-farm-used-ai-lie-americans-what-now">CSIS</SourcePill>
            <SourcePill href="https://azmirror.com/2024/10/08/how-foreign-operations-are-manipulating-social-media-to-influence-your-views/">AZ Mirror</SourcePill>. Meanwhile, major news networks like CNN, CBS, and Fox are either controlled by political or corporate interests, or have lost near billion-dollar lawsuits for knowingly lying to their audiences
            <SourcePill href="https://apnews.com/article/fox-news-dominion-lawsuit-trial-trump-2020-0ac71f75acfacc52ea80b3e747fb0afe">AP News</SourcePill>. These outlets prioritize sensationalism and outrage to keep viewers dependent, ensuring higher profits at the expense of truth.
          </p>
          <p className="mb-4">
            A clear example of the damage caused by misinformation and blatant falsehoods can be seen in how Americans perceive basic demographic facts. A recent YouGov poll found that Americans believe 40% of the population is Black (actual: ~12%), 20% is transgender (actual: ~1%), one-third are first-generation immigrants (actual: ~10%), and that one in five households earn over $500,000 per year (actual: ~1%).
          </p>
          <p>
            These wildly inaccurate perceptions are not accidental—they are the direct result of constant coverage of topics that are either completely fabricated or severely misrepresented. When voters are repeatedly exposed to distorted narratives, it becomes nearly impossible to have honest, policy-driven discussions. That's why PoliGrade was created: to replace noise and misinformation with facts, context, and clarity.
          </p>
        </>
      ),
    },
    {
      question: 'How does PoliGrade differ from traditional political media or sites?',
      answer: 'PoliGrade uses transparent, policy-based criteria to provide simple and objective grades that anyone can understand, regardless of their level of political knowledge. Our approach avoids opinion-driven analysis or partisan interference. We also offer a self-evaluation tool to help voters identify their own priorities and see where they fall within our grading scale. Looking ahead, our goal is to expand PoliGrade into a comprehensive platform that collects and displays the full policy platforms of politicians and candidates—becoming a one-stop resource for what truly matters when choosing your elected officials.',
    },
    {
      question: 'What are the six political parties PoliGrade uses?',
      answer: 'PoliGrade classifies politicians into six ideological categories: Progressive, Liberal, Centrist, Moderate, Conservative, and Nationalist—ranging from most left-leaning to most right-leaning. These terms were chosen for their balance of recognizability and accuracy in describing a politician\'s platform. We recognize that many of these labels, like those of the traditional two-party system, have accumulated unfair baggage and misconceptions over time. Our goal is to reclaim these words for what they were meant to describe—broad philosophical approaches to governance, not insults or dividing lines. By restoring clarity and removing stigma, PoliGrade helps voters move past rhetoric and refocus on policy substance rather than identity or party branding.',
    },
    {
      question: 'What sources, data, and criteria are used to determine how a politician is graded?',
      answer: 'We grade politicians based on their policy beliefs across ten criteria carefully chosen for clarity and span: Economic Policy, Business & Labor, Health Care, Education, Environment, Civil Rights, Voting Rights, Immigration & Foreign Affairs, Public Safety, and Messaging. Our data comes from credible, publicly available sources such as official campaign websites, voting records where applicable, interviews, and reputable databases like Wikipedia. We do not rely on overtly biased or agenda-driven sources—especially those that lack accountability or incentive for accuracy. We also recognize that every elected office has a different scope of power, so our evaluations are adjusted accordingly. For instance, a Governor\'s stance on foreign affairs holds less weight than that of a Senator, since Governors have little authority in that area. This ensures that every grade reflects both beliefs and relevance to the office held.',
    },
    {
      question: 'How often are grades updated?',
      answer: 'We continuously monitor elections, legislation, and policy actions to keep every grade as current as possible. One of our biggest frustrations in politics is the misuse of the term "flip-flopper." Often, when politicians change positions, it\'s not out of opportunism but from gaining experience or learning what\'s realistically achievable within their role. When a politician\'s grade changes, it isn\'t a judgment of their character, electability, or skill—it\'s simply an updated reflection of their record and priorities at that moment. Voters, not us, determine whether that evolution is positive or negative.',
    },
    {
      question: 'How can I use PoliGrade to understand where I stand in the grading system and which politicians I may align with most?',
      answer: 'You can take our 36-question self-evaluation quiz, where you\'ll indicate your support or opposition to various policy ideas—each written in plain, accessible language that anyone can understand, regardless of political experience. The quiz includes four questions for each of the nine most essential grading categories. While it doesn\'t cover every possible issue, it\'s designed to provide a balanced, easy-to-digest overview of your general political alignment. A longer version could easily be 100+ questions, but our focus is on clarity and usability.',
    },
    {
      question: 'What if I disagree with a grade?',
      answer: 'If you disagree with a grade, visit our Contact page and let us know why. A member of our team (probably me) will respond with an explanation of how the grade was determined. If you have additional information, you may even help us make a more accurate assessment. We welcome constructive feedback—feel free to reach out about anything related to the site while you\'re there!',
    },
    {
      question: 'Does PoliGrade collect personal data or track users?',
      answer: 'We don\'t want your data, so we don\'t collect it. The only information we use is limited cookie data that helps save your progress on the self-evaluation quiz. As new features are introduced—such as saving quiz results, syncing profiles, or integrating with YouTube and social media—you\'ll always be notified beforehand and given the choice to opt out. Transparency is central to how we operate.',
    },
    {
      question: 'Who created PoliGrade, and are they affiliated with any political party or organization?',
      answer: 'PoliGrade was created by Jack Kelley (that\'s me). I\'m the first Gen Z elected official in Massachusetts history, with eight years of campaign and policy experience at both the local and state levels—on both sides of the political spectrum. I currently serve in a non-partisan elected role and have no employment or affiliation with any political party or partisan organization.',
    },
    {
      question: 'Can candidates or officials request corrections?',
      answer: 'Yes. Candidates and elected officials are welcome to contact us through the same Contact form as any other user. However, unlike the public, officials also have the option to participate in a recorded interview to clarify their positions or highlight areas they believe were misrepresented. This ensures fairness, accountability, and the opportunity for direct input.',
    },
    {
      question: 'What\'s next for PoliGrade?',
      answer: (
        <>
          As we continue refining the site&apos;s core features, our next steps include adding comprehensive profiles for each graded politician and candidate—allowing users to see not only their grade but also the specific policies and votes that led to it. We&apos;re also expanding our YouTube content
          <SourcePill href="https://www.youtube.com/@PoliGrade">@PoliGrade</SourcePill>
          to offer clear, accessible breakdowns of political issues and grading updates.
        </>
      ),
    },
  ]

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">PoliGrade FAQ</h1>
          <p className="text-lg text-foreground/60">
            Find answers to frequently asked questions about PoliGrade
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion
          variant="splitted"
          selectionMode="multiple"
          className="gap-4"
        >
          {faqData.map((faq, index) => (
            <AccordionItem
              key={index}
              aria-label={faq.question}
              title={faq.question}
              classNames={{
                title: 'text-lg font-semibold',
                content: 'text-foreground/80 leading-relaxed',
              }}
            >
              {typeof faq.answer === 'string' ? (
                <p>{faq.answer}</p>
              ) : (
                faq.answer
              )}
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
