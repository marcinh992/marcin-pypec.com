---
title: 'On the Other Side of the Pull Request'
description: 'A practical checklist for reviewing pull requests with clarity, judgment, and long-term ownership.'
pubDate: 'Aug 28 2026'
tags: ['Code Review', 'Pull Requests', 'Engineering']
---

Hey,

when I decided to write this post, I wanted to achieve two things.

First, I wanted to organize everything I have learned empirically over the years as a software developer about the code review process and about being "on the other side" of a PR.

Second, I wanted to gather in one place the knowledge you might need to do code reviews effectively, whether you want to compare your own experience and conclusions with mine or simply learn something new.

This post is based on the mistakes I have made, the conclusions I have reached over the years working in IT, and the countless articles I have read on the subject.

I also did not want this to become a description of how FAANG companies approach the review process, or some kind of code review dogma.

What I want to create instead is a solid foundation that different teams can adapt to their own needs and requirements, or use to take another look at their existing code review process and see whether there is room to improve it.

I also want to point out that this post is a living document. I will keep updating and expanding it with new conclusions and observations, fueled by whatever new mistakes I manage to make along the way.

## So What Exactly Is Code Review?

The answer is simple: it is a process where another developer evaluates a proposed change before it becomes part of the shared codebase.

That is really all there is to it.

And at the same time, there is a lot more to it.

But what exactly should we be checking? How? In what order? What is valid criticism and what is just nitpicking? What if the same problem can be solved in several different ways?

Is there always only one right answer? Is my answer more right than yours? Which answer is the rightest of them all?

I like to think about code review this way:

As a reviewer, I am responsible for asking myself one fundamental question:

> **Should this change become part of the system?**

Would I want to work with the code I am looking at later on?

Does it meet the standards I expect?

And what standards should I even have in the first place?

Well, this post is dedicated to answering those questions and quite a few others along the way.

The sections are ordered in what I consider a natural review flow: starting with the cheapest things to verify and gradually moving toward the ones that require the most attention and engineering judgment.

## Before I Use My Brain

Following the principle:

> **Automate what can be checked mechanically, spend human attention on what requires judgment.**

I start with the things that can be checked perfectly well by automation: a basic set of CI pipelines.

- Does the code compile?
- Did the tests pass?
- Did linting and formatting checks pass?
- Did static analysis pass?
- Did database migrations pass, if there were any?
- Did any other team-specific quality gates pass, such as security checks, dependency checks, and so on?

If everything above is green, I can move on to the next step.

If something turns red, I follow a pretty simple rule.

If the failure is clearly unrelated to the PR, something like an infrastructure issue, a formatting check, or a well-known flaky test, I do not see a reason to artificially block the review.

If, on the other hand, a business-related test fails, or I cannot confidently say that the failure is unrelated to the PR, I assume that the PR simply is not ready for a deeper review yet.

A failing test may have just uncovered a real problem in the new implementation, and fixing it might mean changing three lines of code or rebuilding a fairly large part of the solution. At this point, I usually do not have enough context to judge how big that change is going to be.

In that situation, it is usually more efficient for me to let the author know and go back to my own work instead of spending time reviewing code that might look completely different in a moment.

And if the author has trouble finding the cause or simply needs another pair of eyes, I am happy to help. But at that point, **we have changed the scope from code review to a pair debugging session**, and that is a different activity.

## Understand the Purpose of the Change

Now comes a very important part of the whole process: understanding the business requirements.

I want to find answers to four questions.

### Why?

Why does this change exist?

### What?

What is it supposed to change?

### How?

How was the problem solved, if the solution needs some explanation or if the author considered different approaches before choosing one?

This does not have to be an essay. My rule of thumb is simple: the less trivial the change, the more important the technical context becomes. So I expect this section to exist in the PR description and to contain enough detail to match the complexity of the change.

### How Do We Know It Works?

How do we know that the change actually does what it is supposed to do?

To answer those questions, I usually look for things like:

- a description of the business or technical problem
- the type of change: feature, bugfix, optimization, refactor, and so on
- acceptance criteria
- expected behavior
- logs
- sample data
- screenshots
- benchmarks
- design docs
- testing instructions

If after reading the task description on the board and the PR description I still cannot explain what this change is actually supposed to bring to the codebase, then I simply cannot review it properly.

For me, that is a yellow light that maybe the task itself was not analyzed carefully enough before development started.

This part should not be brushed aside, because ambiguity or room left for interpretation can easily lead to a situation where business meant one thing, the developer understood something slightly different, and the reviewer or QA interpreted it in yet another way.

For example:

```text
Requirement:
"User should not be able to cancel an order after shipment."

Business means:
SHIPPED and all later states cannot be cancelled.

Developer interprets:
Only SHIPPED cannot be cancelled.

Reviewer interprets:
SHIPPED + DELIVERED cannot be cancelled.

QA interprets:
Everything except CREATED cannot be cancelled.
```

Four people can read one imprecise sentence and come up with four perfectly logical interpretations of it.

There is one more thing worth keeping in mind here:

> **The PR description is documentation too.**

The more relevant context we preserve there, the easier maintaining that code can become later on.

That said, this post looks at pull requests from the reviewer's side. I will go deeper into PR descriptions in a separate post about pull requests from the author's perspective.

Any ambiguity or uncertainty at this stage should be clarified directly with the author.

If something does not make sense to me, I ask immediately, because this is the point where I am building the foundation of everything I am going to rely on later during the review.

I really do not want to mess this part up.

It is a bit like pouring crooked foundations and then acting surprised that everything built on top of them is slightly off.

## Is This Pull Request Actually Reviewable?

The scope of what I want to check at this stage is pretty straightforward.

I ask myself:

1. Does this PR do one coherent thing?
2. Does everything in it actually belong to this task?
3. Are unrelated refactors or cleanups mixed in?
4. Has a feature change been bundled together with a huge refactor?
5. Is the PR larger than it actually needs to be?
6. Can it be split into smaller pieces in a way that still makes sense?

The size of the PR itself matters a lot. I follow one simple rule:

> **Smallest coherent reviewable change.**

Not to be confused with the smallest possible diff.

And size is not just LOC.

The actual size of a PR is influenced by things like:

- lines of code changed
- number of files touched
- concepts touched
- layers touched
- context required to understand the change

If someone sends me a huge PR touching 3,000 lines of code, the rest of that task's lifecycle is very likely going to become proportionally longer as well. Or, to put it more directly: the cost of getting that change into production goes up.

- Reviewing the code itself will take longer.
- There will probably be more comments and issues to address.
- The cognitive load for everyone involved in the review process goes up significantly.
- The risk of missing something important increases.
- The whole lifecycle before production gets longer, which means a higher chance of merge or rebase conflicts with the main branch. Resolving those conflicts takes even more time and can introduce another opportunity for bugs.
- The chances of getting stuck in comment ping-pong also increase.

**What I am looking for is a PR that is as small as reasonably possible.**

If a 1,000-line PR can logically be split into two or three smaller ones, I will usually lean toward splitting it.

By doing that, I am not only doing myself a favor, but also doing the whole team a favor. Less code enters the codebase at once, which also means a smaller blast radius and a lower risk of regression.

There is one important rule though:

> **The system should still work correctly after every merge.**

We should neither expect nor allow changes to be split in a way that temporarily breaks the build.

Not every individual PR has to deliver visible business value to the end user, but every one of them should be safe to merge into the main branch.

## Time to Open the Diff

The first thing I am looking for is the so-called **main part of the change**.

Usually this means one or a few files where most of the actual work happens, while the rest of the changes are mostly built around them.

It might be:

- a service
- a handler
- an endpoint
- domain logic
- a migration
- a new module

Finding that main part makes it much easier to build a mental model like this:

```text
Where does the change start?
-> Where does the data go?
-> What components participate?
-> What actually changed conceptually?
```

Sometimes the easiest way to get there is to start with the tests. After all, what better than tests to describe the expected behavior?

Once I have found the right files, it is time for the first design pass.

I am still not looking at individual lines of code. At this point, I am trying to look at the solution from above.

I check:

- Is this responsibility in the right place?
- Do the boundaries make sense?
- Is coupling increasing unnecessarily?
- Does the abstraction actually add value, or is it overengineering at this stage?
- Is the solution more complicated than it needs to be?
- Does it fit the existing architecture, patterns, and standards?
- Are we duplicating code or concepts?
- Is there only as much code as we actually need right now?
- Will this part of the system still be reasonable to maintain and extend later?

If any of those questions make me uncomfortable, this is a good moment to stop and leave the first round of feedback.

A negative answer to one of them may point to a fundamental design problem, and that can mean a significant part of the PR is going to change anyway.

For example, imagine that the developer decided to solve the task using reactive programming, even though it is not required for the feature to work and reactive programming does not exist anywhere else in the codebase.

That immediately turns on a yellow warning light in my head:

- Is this actually useful, or are we overengineering the solution?
- Does the rest of the team know reactive programming well enough to work with this code effectively?
- What problem are `Mono` and `Flux` actually solving here?
- Why are we introducing this programming model in the first place?

If most of the team is seeing words like `Mono` and `Flux` for the first time, my seventh developer sense is already telling me that trouble is probably coming.

## Did We Solve the Right Problem, and Did We Solve It Correctly?

At this stage, I try to map the change like this:

```text
Requirement
<-> Acceptance criteria
<-> Behavior
<-> Implementation
```

Then I check things like:

- the happy path
- failure paths
- edge cases
- boundary conditions
- error handling
- backwards compatibility
- non-obvious business consequences
- behavior for existing users and existing data

The goal here is not just to verify that the code "works".

I want to make sure that the behavior implemented in the code actually matches the original requirement and the acceptance criteria we started with.

If the change is user-facing or particularly risky, I also want to go through the whole flow manually.

There is a big difference between:

> **The tests are green.**

and:

> **I actually used the feature and it behaves the way it is supposed to behave.**

For example, if the PR changes a form, adds a new field, changes validation, or modifies the way suggestions are loaded from the backend, I want to open the application and actually click through that flow myself.

If I submit the form and get a `500`, or the new field behaves differently than described in the task, there is very little value in spending another hour on a detailed implementation review. The change is simply not ready yet.

This is another place where I prefer to fail fast.

## Good Morning, Are Your Tests Running?

Let me put it bluntly: tests are every developer's safety net.

Anyone who does not write tests clearly does not have enough stress in their life already.

At this stage, my job is to check:

1. Are we testing the right behavior?
2. Are the acceptance criteria from the task reflected in the tests?
3. Are the most important parts of the change actually covered?
4. Are edge cases and failure paths covered?
5. Do the assertions make sense?
6. Are the tests readable?
7. Do the tests take a responsible amount of time to run?
8. Do the mocks actually make sense, or are we mostly testing the mocking framework?
9. What does the code coverage look like, and more importantly, which lines are covered and which are not?

Looking at code coverage may sound a bit controversial at first, but the idea behind it is pretty simple: I want a quick way to see which parts of the implementation are exercised by tests and which ones are not. That gives me another signal that something important may have been missed or that all the critical paths are actually protected by tests.

I definitely do not expect some blindly enforced rule like:

> **Coverage > 80%.**

Or anything along those lines.

I am much more interested in **where the potential hole is that could eventually sink the ship**.

## `getById` or `findById`: Does Changing the Name Actually Change Anything?

This is finally the stage where I can go down to the level of individual lines of code.

My checklist for this part looks like this:

1. **Understandability: do I understand this?**
   - naming
   - readability
   - comments
   - documentation
2. **Structure: is this built in a sensible way?**
   - complexity
   - responsibilities
   - duplication
   - dependencies
3. **Correctness: does this behave correctly?**
   - control flow
   - error handling
   - nullability
   - contracts
   - state and mutability
   - side effects
4. **Interface and consistency: does this work well with the rest of the system?**
   - API design
   - style
   - project conventions

I have described some of the less obvious points below, but I do not want this list to be treated as a heuristic like:

> "If you find any of these things, leave a comment."

This checklist tells you **where to focus your attention and what questions to ask yourself**.

It does **not** tell you **which constructs in the code you should fight against**.

There are very few universal answers in programming. Should a method with five arguments be refactored? Do two similar pieces of code mean we should immediately extract their common part?

It depends.

### Naming

Does the name clearly tell me what something is or what it does?

Is the domain language consistent with the terminology already used in the project?

Does the same concept already exist under a different name?

Does the name promise something different from what the code actually does?

Is it too generic: `data`, `process`, `handle`, `manager`, `utils`?

Do I have to read the implementation just to understand what the name means?

Naming is an integral part of domain modeling. Cosmetics are secondary here.

### Readability

Can I follow the code easily without constantly stopping to reconstruct what is happening in my head?

A lot of things affect this: the length and structure of methods, abstraction levels, the order of operations, the overall flow, and whether the code explains itself.

I am not trying to turn every method into a clever one-liner. I simply want the code to be as easy to read as reasonably possible.

And if understanding five lines of code requires me to jump through seven classes, four interfaces, and two factories, then yes, every individual piece might technically be "clean", but reading the whole thing is probably not going to be one of the highlights of my day.

### Complexity

Here I think it is important to distinguish between two types of complexity:

**Inherent complexity** and **accidental complexity**.

The business problem itself may be complicated, and there is no way around that.

What I am trying to figure out is whether the implementation added unnecessary complexity on top of an already complicated business problem.

Some things I look for:

- unnecessary abstractions
- deep inheritance hierarchies
- complicated conditions
- premature generalization
- design patterns used simply for the sake of using a design pattern

If I had to reduce this whole section to a single question, it would be:

> **Does the problem actually require a solution this complicated, or did we make it complicated ourselves?**

And of course, this is where YAGNI immediately comes to mind.

### Responsibilities

Is this just the first letter of SOLID?

Not exactly.

What I am really asking is:

Is the responsibility located in the right place?

Does this class or method know more than it should?

Is the class slowly gaining more and more responsibilities?

If one class is responsible for validation, persistence, mapping, and sending emails, well, somebody is starting to put on some weight.

A useful smell is when we struggle to answer a seemingly simple question:

> **What is this class actually responsible for?**

### Duplication

Are we duplicating the same business rule?

If that rule changes, will we have to remember to update it in several different places?

Did the duplication happen by accident?

And perhaps more importantly: would removing it create an artificial abstraction that connects things which only happen to look similar right now?

There needs to be some balance here.

Both extremes are bad:

> **Copy-paste everything.**

and:

> **DRY at all costs.**

### Control Flow

In other words: how easy is it to follow all possible execution paths?

I pay attention to things like:

- nested `if`s
- complicated `switch` statements
- early returns
- loops
- exceptional paths
- state mutations during the flow

I do not want to be misunderstood here: these are tools, not a list of code smells. They are simply places worth paying attention to.

The question I care about is:

> **Can I explain the states this code can end up in without needing a piece of paper and a pen?**

### Error Handling

- Are errors actually handled?
- Does a `catch` block silently swallow an exception?
- Are we catching the right type of exception?
- Does the user or caller receive the appropriate result?
- Are errors being logged? Does logging them make sense? What exactly are we logging? Could any sensitive information end up there?
- Does the system remain in a valid state after a failure?
- Could a partial failure leave corrupted or inconsistent data behind?

### Nullability

An inseparable part of Java.

I am not only interested in finding a potential `NullPointerException`.

The more important question is:

> **Where is `null` allowed to enter the system?**

So I ask:

- Is `null` even a valid state here?
- Would using `Optional` make sense?
- Are we missing validation somewhere?
- Do we have defensive null checks scattered all over the code instead of defining the contract properly at the boundary?

### Contracts

Probably the most abstract item on my checklist.

What can the caller expect from a component, and what does that component expect from the caller?

Things like:

- required inputs
- possible outputs
- behavior on failure
- side effects

Take a very simple method:

```java
User findUser(Long id)
```

A few questions immediately appear:

- Can it return `null`?
- Does it throw an exception?
- Is the user guaranteed to exist?
- Is the caller supposed to check that beforehand?

A tiny method signature can hide quite a large contract.

### API Design

If the PR changes a public or internal API, I ask:

- Do the request and response models represent the problem properly?
- Does the API leak implementation details?
- Is the change backwards compatible? Does it need to be?
- Does the validation make sense?
- Are errors unambiguous?
- Can the caller easily misuse the API?

### Comments

I am not a huge fan of comments.

If the code is so unclear or complicated that we need a paragraph next to it just to explain what it is doing, that alone may be a sign of a design problem.

Sometimes, however, there is simply no better way to preserve important context.

For example:

```java
// Provider may deliver the same event more than once,
// so processing must remain idempotent.
```

This is not from the same family as:

```java
// Increment counter by 1.
counter++;
```

So the comment may have a very good reason to exist.

What I care about is:

- Do we actually need this comment?
- Could we change the code in a way that makes the comment unnecessary?
- Does the comment add context that is not visible from the code itself?
- Does it explain an unusual situation or decision?
- Is it still true, or is it a leftover from an implementation that disappeared two years ago?

Because you know what is worse than a comment?

An old, expired comment.

### Documentation

This is somewhat related to comments, but here I am talking more about things like:

- README
- API docs
- Swagger/OpenAPI
- configuration documentation
- deployment instructions
- wiki pages

If the system now requires a new environment variable to start, there should be a trace of that somewhere in the documentation.

What does the variable represent?

Is it required?

What format does it expect?

Does it have a default?

Is it a secret?

A change is not really finished if everyone has to discover the answers to those questions the hard way.

### Dependencies

There is no point in reinventing the wheel.

At the same time, before adding another dependency, it is worth asking whether we actually need it or whether the tools and libraries already present in the project are enough.

## Cross-Cutting and System Impact

And with that comes another fairly long list of things worth checking.

Not all of them will matter for every PR. A lot depends on what the change actually touches, but I like to keep them somewhere in the back of my head:

- performance
- database calls and N+1 queries
- concurrency and race conditions
- transactions
- security
- authorization
- logging
- observability
- metrics
- migrations
- external integrations
- rollback
- retries, timeouts, and idempotency

At this point, I am deliberately stepping outside the boundaries of the diff itself and looking at the change from a wider system perspective.

The question is no longer only:

> **Does this code look correct?**

but also:

> **What happens to the rest of the system once this gets merged?**

A change can look perfectly reasonable in isolation and still introduce problems somewhere else: extra database load, broken transaction boundaries, missing authorization, noisy logs, retry storms, migration issues, or behavior that becomes painful the moment an external dependency starts failing.

This is the part where I try to think less like someone reading code and more like someone who may have to operate, debug, and maintain the consequences of that code later.

## Review Your Code Review

Sounds like an oxymoron?

Not really.

This is another important part of the process.

For every comment I leave, I try to ask myself:

1. **Is the current solution actually incorrect?**
2. **Does it violate a requirement or an established project rule?**
3. **Does it violate an important engineering principle in this particular context?**
4. **Can I point to a real consequence or cost of leaving it as it is?**
5. **Or do I simply prefer a different implementation?**

Then I classify the comment as:

- **Blocking**
- **Suggestion**
- **Nit**

If you make it all the way to question number five and still cannot give a good answer to questions one through four, then you probably do not have a blocking issue.

You can still leave a `NIT` or a `SUGGESTION`, but it is worth remembering that personal preference and taste should not magically become a project rule just because you are the reviewer.

For a comment to have real value, it should point to an actual technical consequence.

> "I would do this differently."

is not really an argument.

If several solutions are equally valid, accept the author's choice. Leave a `NIT:` if you want to suggest another option, but do not block the PR just because your version feels nicer to you.

### What Should a Useful Comment Look Like?

I usually try to follow this structure:

```text
What is the problem?
-> Why does it matter?
-> What is the consequence?
-> What direction could solve it?
```

This gives the author more than just a command to change something.

Maybe they got tunnel vision while working on the task and unintentionally locked themselves into one approach.

Or maybe I am the one who reached the wrong conclusion and I am simply wrong.

Either way, explaining the reasoning creates space for an actual engineering discussion instead of a remote rewrite of somebody else's code.

## Ping-Pong

So, we have left our comments. The author has read them and responded.

What now?

The first question I ask myself is:

> **What if they were right?**

If they were, I drop the comment.

If I still disagree:

- I take their arguments into account.
- I explain my own reasoning more clearly.
- I evaluate the trade-off between the expected benefit and the cost of the requested work.

At some point this can inevitably turn into comment ping-pong.

And that is usually a pretty obvious signal that it is time to stop typing and have a 1:1 conversation.

A short conversation will often be far more efficient than another ten rounds of comments.

There is one important thing though: the **outcome of that conversation should not become tribal knowledge**.

I like to write a short summary back in the PR so that the reasoning behind the final decision is still there for whoever comes across it later.

If we still cannot reach an agreement, it is probably time to bring in a third person like a domain expert, another experienced developer, or the team lead.

And if the problem is important or unclear enough that even this does not solve it, we escalate further and involve the wider team or whoever else can bring the missing context needed to make the decision.

## Re-Review

At this point, the PR author agreed with our concerns and pushed changes to address them.

So what do I check now?

- Did the CI/pipeline pass again?
- Have all review comments actually been addressed?
- Did the fix introduce any new problems?
- Is the updated solution still coherent as a whole?
- Did any new changes appear that also need to be reviewed?

A re-review should not mean:

> "Yep, the red comments are gone. LGTM."

The code changed, so I want to make sure the new version still makes sense as a complete solution.

Sometimes fixing one issue creates another one somewhere else, or the author adds a few extra changes while addressing feedback. Those changes deserve the same attention as anything that was there in the first review.

In other words, I am not only checking whether my comments were resolved.

I am checking whether the **current version of the PR** is actually ready to move forward.

## Final Sanity Check

The final stretch before approval.

At this point, I take a step back again and look at the whole change from a higher level:

1. Do I understand why this change exists?
2. Does it implement the required behavior?
3. Have the important risks been covered?
4. Is the design good enough?
5. Do the tests give me enough confidence that everything works as expected?
6. Are there any unresolved blocking issues?
7. Did I confuse personal preference with an engineering principle?
8. Would I want to maintain this code later?
9. Would I be able to debug this code in production later?

and finally:

> **Should this change become part of the system?**

If I can answer that last question with a clear **yes**, I can approve the PR with a clean conscience.

If I had to compress the entire process into one flow, it would look something like this:

```text
0. Right reviewer?
-> 1. Mechanical gates
-> 2. Understand WHY / WHAT
-> 3. Does the change make sense?
-> 4. Is the PR reviewable?
-> 5. Find the main part
-> 6. Design pass
-> 7. Functional correctness
-> 8. Tests
-> 9. Implementation quality
-> 10. System / operational impact
-> 11. Review your own comments
-> 12. Give actionable feedback
-> 13. Resolve discussion
-> 14. Re-review
-> 15. Final sanity check
-> APPROVE
```

Sixteen steps, huh?

At first glance, this probably looks more like a Boeing startup checklist than a code review process.

The good news is that with a small, well-prepared PR, some of these steps take literally a few seconds.

But there is also another side to this.

## Why Should I Care This Much in the First Place?

One idea from Uncle Bob that stuck with me is that **programmers are stakeholders whether they want to be or not**.

And I think this is very easy to forget.

The codebase we work on is not some abstract collection of classes living in a Git repository. In many cases, this software is literally what allows a company to make money.

That money pays developers.

But it also pays QA engineers, business analysts, product people, customer support, sales, accountants, HR, operations, managers, and plenty of other people who may never see a single line of the code we are discussing.

It pays mortgages.

It puts food on tables.

And suddenly:

> **It is only a little technical debt, we will clean it up later.**

does not sound quite as harmless anymore.

Of course, I am not saying that one ugly method is going to bankrupt the company and get the accounting department fired.

The problem is that these decisions accumulate.

> **Small improvements compound.**
>
> **Unfortunately, small compromises compound too.**

One missing test does not destroy a project.

One undocumented workaround does not destroy a project.

One poorly placed dependency does not destroy a project.

One `// TODO: fix later` does not destroy a project.

But repeat the same kind of decision hundreds or thousands of times over several years, and eventually somebody has to pay for it.

And very often, the people paying for those decisions are not the people who made them.

I have worked with systems where decisions made close to a decade earlier were still affecting how much effort seemingly trivial changes required today.

Missing tests.

Missing documentation.

Business rules scattered across the codebase.

Workarounds built on top of older workarounds.

Decisions nobody could explain anymore because the people who made them had left years ago.

At some point, working with a system like this starts to feel a little bit like playing Jenga.

The tower is still standing.

Everybody can see that it is standing.

So technically everything is fine.

But every time you need to make a change, you are staring at the next block wondering:

> **Is this one safe to touch, or is this the one that brings half of the tower down?**

And suddenly adding one field to a form is no longer a one-hour task.

You first need to figure out why three services depend on this field, why one scheduled job writes to the same table, why there is a null check that apparently prevents some production issue from 2018, and whether changing any of it will break a customer nobody remembered was using this flow.

That is the real cost of neglected code health.

Not that the code looks ugly.

**Change becomes expensive.**

**Developers become slower.**

More time is spent understanding and protecting existing behavior than actually delivering new behavior.

And eventually this stops being purely a technical problem and starts becoming a business problem.

I have seen what happens when maintaining a system becomes increasingly expensive while the team's ability to deliver keeps going down. At some point, those costs have real organizational consequences as well.

That is why I think ownership matters.

You do not need to refactor half the codebase every time you open a pull request. That would be just another way of making development painfully slow.

But at the very least, we should try not to leave the system worse than we found it.

And when there is a small, safe opportunity to improve something along the way, it is usually worth taking it.

Think of it less like preparing for the next sprint and more like preparing for an ultramarathon.

A single step does not matter much.

But after tens of thousands of them, the direction of every small step starts to matter a lot.

The code we merge today may still be here five or ten years from now.

We might not be.

And somebody we have never met may eventually have to understand the decisions we are making right now.

That, to me, is a good enough reason to take code review seriously.

And I want to repeat something important before wrapping this up: the purpose of this post was never to create the one and only ultimate way of doing code review.

> **It is a checklist of places worth directing your attention to.**

We are not looking for perfection in code, because perfect code does not exist. A huge part of software engineering is making as many good trade-offs as possible, and understanding those trade-offs is what we should really be looking for.

If there is one thing I would like you, dear reader, to remember after reading this whole thing, it would probably be the same question that appeared near the beginning:

> **Should this change become part of the system?**

The methodology I have described is simply meant to help collect enough information to be able to confidently say:

> **Yes. I believe this is code we can maintain, extend, and probably end up debugging at two in the morning someday.**

As I mentioned at the beginning, I treat this post as a living document.

My approach to code review has changed over the years, and I see no reason why it should suddenly stop changing now.

I will probably do more than one stupid thing in the future that forces me to rethink some of what I have written here, and that is fine. My perspective should evolve as I learn more.

Code review, however, is only one side of the coin.

I definitely want to come back to pull requests from the author's perspective: how to go through the whole process as the person creating the change, make the reviewer's job as easy as reasonably possible, and avoid forcing them to reverse-engineer what the hell the PR is supposed to be doing.

I also want to take a broader look at when a task is actually ready for development, working with legacy code, and a few other topics where I think I may have something useful to add.
