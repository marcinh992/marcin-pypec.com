---
title: "On the Author's Side of the Pull Request"
description: 'How to prepare pull requests that carry context, reduce review friction, and make future maintenance easier.'
pubDate: 'Sep 8 2026'
tags: ['Pull Requests', 'Code Review', 'Engineering']
---

## Why Does This Matter?

Code shows a developer what the system does today. A pull request can tell them **why it works this way in the first place.**

A PR can document the decisions that were made in a project, but also the ones that were rejected.

It can show what challenges the developer faced, what solutions they considered, why they eventually chose one over the others, where they still had doubts, how the change should be tested properly, and what the expected behavior actually is.

Do not get me wrong, I am not talking about documenting every single thought that crossed your mind during twelve hours of working on a task.

What I am interested in is the actual meat: the decisions and context that may matter to someone working with this code later.

If the project is still young, things like this may seem unimportant, but this is a long-term investment.

Imagine the following situation.

You join a logistics company and start working on a system responsible for planning routes for delivery drivers.

One of its key components is an algorithm that determines the order of stops on a route so that the route is as efficient as possible.

The algorithm was originally created a good five years ago as part of an MVP and has been developed many times since then. Business requirements changed, route-planning priorities changed, edge cases were fixed, new exceptions were added, etc.

You were not involved in any of those stages.

What is more, none of the people who understood the algorithm in detail still work at the company.

The remaining developers only know this part of the system on a surface level. They roughly know what it is responsible for and where it lives, but they cannot explain all the business and technical decisions that eventually made it look the way it does today.

And according to Murphy's law, a ticket appears on your board:

> The algorithm produces inefficient routes causing vehicles to travel longer distances than they actually need to.

The task lands on your desk.

You read the description, open the code, and start analyzing what exactly needs to change and where.

Eventually, after 12 hours and a few espressos, you manage to come up with a solution. You modify the code, add tests, and finally start seeing some light at the end of the tunnel.

The last thing left before pushing the code to the repository is to run the existing test suite and then... something feels off.

One single test lights up orange.

A test that checks the exact behavior you just "fixed".

So naturally, one question comes to mind:

> **Is this test outdated and should I update it?**

Or maybe the exact opposite is true, maybe the test just did its job and caught a bug in my new implementation?

Every developer I ask about this test gives me roughly the same answer:

> I do not know, sorry. I cannot help you with that.

We have no idea why the test expects this particular behavior.

So now the archaeology begins.

I find the commit and the pull request where this part of the code was originally introduced.

And this is where the story splits into two paths.

Let us imagine two scenarios.

## Scenario 1

The PR was created three years earlier, when the algorithm had already been running in production for some time.

It turns out that around that time the company replaced its fleet of combustion-engine vehicles with electric ones.

Previously, a vehicle could drive the entire day on a single tank of fuel, so the algorithm did not need to account for refueling during the route.

Electric vehicles changed that assumption.

The algorithm now had to take battery charging into account somewhere in the middle of the route.

Fortunately, the developer who implemented this change understood that details like this matter and included a link to the original task in the PR description.

It turns out that you do not actually have access to it because a few years earlier the company was using a different board or even a completely different tool, Kanbanize, for example, while today the whole team works in Jira.

As a new employee, nobody even thought about giving you access to the legacy system.

But at least this tells us one important thing: **the task exists and we know where to find it.**

So you message the administrator and ask for access.

And this brings us to another important point:

> **A link to an external system is useful, but a PR should not outsource all of its context to external tools.**

The board can be migrated.

The wiki can disappear.

Slack may have a 90-day retention policy.

People can leave the company.

The repository history stays.

Fortunately, the author of the PR understood that as well and did not stop at pasting a link.

The PR description itself also explained the business purpose of the change.

You learn how the algorithm behaved before, why that was no longer sufficient, and what new requirement appeared after the fleet was electrified.

In the next section, the author described the implementation at a high level.

They explained which part of the system was being changed and why the change belonged there.

They documented the important assumptions, the alternatives that had been considered, and their pros and cons.

At the end they left testing instructions:

- where to go
- what to configure
- which flag to enable

and most importantly, **how to tell whether the result is actually correct**.

They also pointed out that one particular integration test existed specifically as regression protection.

And suddenly, all the pieces started falling into place.

You think to yourself:

> Ah. So I did not actually fix a bug at all. I changed system behavior that had been introduced deliberately and was still protected by a test.

The obvious next question is:

> **Why does the current ticket describe this as a bug?**

## Scenario 2

You find the same PR.

The description is empty.

The commit message says something like:

```text
fix routing
```

The task no longer exists or you do not have access to it.

There is no information about why the change was made.

There is no information about what alternatives were considered.

There is no information about what exactly the test is protecting.

There is no information about how to properly verify the behavior.

You are in exactly the same place you were before.

You still do not know whether the test caught unwanted behavior or whether the test itself is wrong and should be changed.

Let us imagine the consequences of Scenario 2.

You make a simple assumption:

> Someone reported a bug -> the code must be wrong -> the test is outdated.

You fix the implementation.

You update the test.

You get an approval.

The change goes to production.

A few hours later, the helpdesk starts receiving reports from drivers.

Some vehicle routes were planned without taking charging stops into account.

The vehicles do not have enough battery to complete the route.

And there are a hundred cases like this.

I do not think I need to describe what happens next.

It definitely would not be pleasant.

Fortunately, we work in a team that understands the consequences of even such seemingly mundane decisions as writing a proper PR description.

So we know that the current behavior did not appear by accident.

Instead of immediately changing the code, we contact the author of the current ticket.

We explain the situation and ask one more time:

> **Are we sure this is actually a bug? Is the application perhaps supposed to work this way?**

And suddenly the analyst/helpdesk starts having doubts.

A few calls later, it turns out that the algorithm is actually working correctly.

What changed was the business.

The company reintroduced some combustion-engine vehicles into the fleet, for example in smaller towns where the charging infrastructure is poor. In those places, using a combustion-engine vehicle simply turns out to be more efficient.

The helpdesk received several similar reports and assumed that the algorithm had a global bug.

In reality, the task should have looked more like this:

> Because combustion-engine vehicles have been reintroduced into the fleet, the routing algorithm should take the vehicle type into account when planning a route.
>
> An electric vehicle may require a charging stop.
>
> A combustion-engine vehicle can complete the entire route on a single tank, so an additional stop should not be planned.

And that is where a fundamental change happened.

> **The ticket stopped being a bug and became a feature.**

What is more, thanks to the project history, we can also find the implementation from before the fleet was electrified and see how combustion-engine vehicles were handled back then.

That does not mean we can blindly bring the old code back to life and call the task solved, but the old implementation gives us a proven point of reference and helps us understand what assumptions were valid at the time.

In practice, it may turn out that instead of rewriting the algorithm, what we really need to do is distinguish between two business cases.

Some of you may be thinking:

> But this was the analyst's or helpdesk's fault. The developer only implemented what was written in the task.

I have only one answer to that:

> **Whose fault it was does not really matter.**

Of course, we should figure out where the misunderstanding happened so we can reduce the risk of similar incidents in the future. But looking for the root cause is one thing, and looking for someone to point a finger at is something completely different.

We all work for the same company, we have the same goal, and we are playing for the same team.

An attitude like:

> It was not my fault, it was theirs.

does absolutely nothing good for the product.

In a large and complicated system there is no single person who knows everything.

Maybe the helpdesk saw ten similar reports in one day and, quite reasonably, assumed that the problem was global.

This story is obviously intentionally a little dramatic and exaggerated, but the mechanism I am describing is nothing exotic.

Someone once saved fifteen minutes by not describing their pull request properly. Five years later, someone else has to reconstruct a business decision from code, tests, and `git blame`.

If this story had actually happened, the company could have ended up with a hundred electric vehicles that needed someone to drive out with a generator, reload the packages, and inform customers that their deliveries would be delayed.

I once heard one of the best developers I have had the chance to work with say:

> 80% of problems in IT are caused by communication between people.

Well, I do not know if it is really 80%, but after years of working in this industry I have come to realize that situations like the one I described happen surprisingly often.

And diagnosing the root cause can be difficult because usually several different factors contribute to the problem and the situation is rarely completely black and white.

A good PR description, however, is one of the cheapest ways to reduce that problem.

It turns tribal knowledge into project knowledge: knowledge that does not leave the company together with the person who had it in their head.

Now that we know what kind of consequences can come from neglecting something as seemingly simple as this, let us get to the actual meat of it:

> **What should a good pull request look like?**

## Do You Own This Change, or Does This Change Own You?

To describe something properly, I first need to understand it myself.

Why do I want to introduce this change?

How did the system behave before?

How will it behave after my change?

Where does the new flow begin?

Which components are involved?

What assumptions am I making?

What could break?

How do I know that the solution actually works?

If I can answer all of those questions, there is a pretty good chance that I actually understand the change I am about to introduce into the codebase.

That does not mean I am right, though.

I may have missed something, misunderstood the requirement, locked myself into one solution and failed to notice alternative paths, or simply not know the codebase as well as some of the other developers.

If, on the other hand, I cannot answer even one of those questions, I treat it as a warning light.

Did I actually analyze the change carefully enough?

Or did I avoid an uncomfortable part of the problem somewhere along the way, take something for granted, or simply take a shortcut because I was under time pressure?

This is also a good moment for a small engineering hygiene check.

Before moving on, I like to take one quick look at the diff itself.

Not to review the whole implementation again, but simply to make sure that none of the development leftovers accidentally made it into the change:

- debug logs
- commented-out code
- temporary comments or TODOs
- accidental refactoring unrelated to the task
- files changed only because the IDE reformatted them

So basically, I want to make sure that what I am about to submit is the actual change, not the implementation scratchpad.

Alright, now I know that my code contains only what actually needs to be there. The next thing I need to look at is the size of the diff itself.

At this point, I have to decide whether the changes should go in as a single PR or whether I need to split them into several smaller ones.

And this is worth stopping for a moment to explain because this decision matters.

A lot.

I am now standing in front of a decision that can make the rest of the process of getting my changes into the main branch either smooth and painless or a trip through hell, both for me and for the reviewer.

What I am trying to achieve is to create the smallest PR I reasonably can.

It is difficult to give a strict definition of the perfect PR size and honestly, I am not even sure such a short universal definition exists.

But in my opinion, the kind of PR I should be aiming for is:

> **One self-contained, coherent change.**

Small PRs come with a lot of advantages:

- review is faster; it is much easier for another developer to find ten minutes a few times during the day than to sit down for an uninterrupted hour
- the review can be more thorough
- there is less surface area in which I can introduce a bug
- less changed code means a lower risk of merge conflicts
- it is easier to reason about the design
- rollback is easier
- they fit perfectly with the idea of releasing fast and releasing often

Have you ever worked on a large feature that cost you a lot of time and effort, sent it for review thinking the hard part was already over, only to discover that the review process was somehow more exhausting than the development itself and everything slowly turned into chaos?

Let us imagine I get a task like this:

Large legacy code refactor:

> `PaymentService` has grown to more than 1,200 lines and is currently responsible for payment validation, request mapping, communication with the provider, transaction persistence, and retry logic.
>
> Refactor the service.

Putting all of that into one large PR could easily result in 2,000 changed lines. Methods moving between classes, new abstractions being introduced, old code being removed.

The result would be one enormous diff that would somehow have to prove, all at once, that despite rebuilding half the thing, the business behavior remained exactly the same.

Not to mention the conflicts that could start appearing over time between the refactoring branch and `main`.

But I can do this much more cleanly and reduce the risk at the same time:

```text
PR #1 - Add characterization tests for current PaymentService behavior

PR #2 - Extract payment validation into PaymentValidator

PR #3 - Extract request/response mapping into PaymentMapper

PR #4 - Extract provider communication into PaymentProviderClient

PR #5 - Remove obsolete code and simplify PaymentService
```

Each change now has its own goal and instead of one monster PR I have a series of small changes.

I can now send the first PR for review and the developer looking at it only needs to verify whether the tests are written correctly.

They do not need to worry about whether I accidentally changed the business logic because the diff consists only of adding the test class plus perhaps some supporting test code.

The following PRs work in much the same way.

Each one narrows down the number of questions I need to answer.

With `Extract payment validation into PaymentValidator` I do not have to think about a new provider client, retry logic, persistence, and eight other things at the same time.

What matters is whether the responsibility for validation was moved correctly and whether the behavior of the system remained unchanged. PR #1, which has already been merged, should help a lot with verifying that.

> **This is what optimizing the entire code delivery flow looks like.**

Instead of keeping one enormous branch alive for days or weeks while it drifts further and further away from the main branch, I regularly integrate small pieces of work.

If, by PR #3, it turns out that I have chosen the wrong direction, I do not have to throw the entire massive refactor away.

The first two steps have already been reviewed and integrated, so the cost of changing direction is much smaller.

And if something does go wrong, it is much easier to identify the source of the problem when I am dealing with a 150-line change instead of a single 2,000-line change touching half the module.

Rollback is simply cheaper as well.

Instead of reverting one huge change:

```text
Refactor entire payment subsystem
```

I only need to revert:

```text
Extract provider communication into PaymentProviderClient
```

## Do Your Commits Tell a Story or Document a Nervous Breakdown?

Now that I know what kind of scope I should aim for in a single pull request, the next step is organizing those changes into commits.

Individual commits should represent logical steps leading from the previous state to the new one. That does not necessarily mean that keeping the "natural developer order" is a good idea, though.

That history could look something like this:

```text
- Extract PaymentMapper
- Fix mapper tests
- Move response mapping
- Add missing request field mapping
- Fix PaymentService tests
- Remove old mapping methods
```

At first glance, it does not look that bad.

Those commits represent a very realistic development process:

- first I extracted the mapper
- then one of the tests stopped passing
- I moved the response mapping
- I noticed a missing field
- etc.

The problem is that these commits mainly describe **the order in which I discovered things during implementation** rather than **the best way to understand the final change**.

It will be easier to work with this code later if I organize the commits more like this:

```text
- Add PaymentMapper for payment request mapping
- Move payment response mapping to PaymentMapper
- Update PaymentService to use PaymentMapper
- Remove obsolete mapping logic from PaymentService
```

Is this perfect?

I do not know.

But it is definitely much more logical.

Each commit has its own purpose and answers a specific question:

1. What did I add?
2. What did I move into it?
3. Where did I start using it?
4. What old code can I remove because of it?

So a good commit history should describe the structure of the final change.

Of course, as usual, there are no strict rules here and everything depends on the specific case.

The point is not to artificially multiply commits. If something can be sensibly expressed in two commits, then two commits are better than four created just for the sake of having four.

Once again, I do not want to create another list of things that are always good or always bad.

There is no magic number of commits and there is no single correct way to split them.

The idea is simply to start looking at commit history as a way of telling the story of a change and over time develop a feel for when that split actually helps and when it starts becoming artificial.

## Reviewer Cannot Read Your Mind

Alright, my PR is split into commits, I push the changes. Should be good enough. Let us call it a day, right?

Not quite.

At this point, I can consider the implementation itself finished. Now I want to show the changes I have prepared to another person.

And this is where a problem appears.

I have been living with this task and this code for the last several hours or maybe even days.

I know what the problem was and how the system behaved before. I remember which solutions I considered and which ones I rejected. I also know why that one weird-looking line of code absolutely has to be there.

The reviewer knows none of that.

They are opening my pull request for the first time and all they can see is the title, the description, and the diff.

That is why whenever I prepare a PR, I try to keep one simple rule somewhere in the back of my mind:

> **You have context. Your reviewer does not.**

My job is to give them enough context using as little text as reasonably possible.

Otherwise, they will have to reverse-engineer all of it themselves.

But that is not the only reason.

A pull request does not magically disappear the moment I click `merge`.

A month from now or three years from now, someone may land on my code through `git blame`, open the related PR, and ask themselves:

> Why the hell did we do it this way?

That is why I treat a PR as a piece of documentation, a record of what I changed, why I changed it, and what decisions led me to this particular solution.

### It All Starts With the Title

The first thing I see when creating a PR is its title.

I do not need to be creative here. The title should answer one simple question:

> **What changed?**

So titles like these probably are not the best idea:

```text
fix bug
add patch
payment changes
move code
TASK-421
```

`Fix bug`?

What bug?

Two years from now, a title like that will only add more noise.

Something like this is much more useful:

```text
Extract payment mapping from PaymentService into PaymentMapper
```

The title alone already tells me what I can expect from the change.

This becomes especially important in repositories that use squash merge because that title may later become part of the Git history.

So ideally, the title should be able to stand on its own even if nobody ever opens the pull request itself.

If the PR title tells me **what**, then the description needs to answer a few more questions:

**Why?** Why does this change exist in the first place?

**What?** What system behavior am I changing?

**How?** How did I solve the problem?

For a simple task this may literally be just a few sentences.

For more complicated or less obvious changes, I want to preserve information that neither the reviewer nor future developers looking at the PR will be able to extract from the diff alone.

If I considered three different solutions and rejected one of them for a specific reason, I write it down.

If I consciously decided to accept a particular trade-off, I write it down.

If I have doubts about a specific part and I especially want the reviewer's opinion there, I write that down too.

The point is not to always pretend I am an expert who is 100% confident about every change and every decision I have made.

Quite the opposite.

```text
I am not exactly convinced that PaymentService is the right place
to own this dependency. I would especially appreciate feedback
on this part.
```

That kind of information is much more valuable than hiding the doubt.

I am pointing directly at the place where the reviewer's engineering judgment may be particularly useful.

One thing I am not a huge fan of is simply rewriting the diff into the PR description.

I do not see much added value in something like this:

```text
- added PaymentMapper
- updated PaymentService
- removed old mapping methods
- added tests
```

Git already shows me that.

What I am much more interested in is why `PaymentMapper` was introduced, what problem it solves, and whether moving the mapping changed the behavior in any way.

For example:

```text
Why?
PaymentService currently owns both payment business logic and
request/response mapping. This PR is another step in reducing its
responsibilities without changing existing behavior.

What?
Request and response mapping has been moved to PaymentMapper.
PaymentService now delegates mapping to the new component.

How?
Existing mapping logic was moved without changing its behavior.
The obsolete mapping methods were removed from PaymentService.

Review focus
The main thing I want to verify is that the extraction did not
change any existing field mappings.
```

It is also always worth linking the related task from Jira or whatever other board the team is using.

I would not treat that link as a replacement for a properly written description, though, because I have no guarantee that I will still have access to it a few years from now.

> **In my opinion, a PR description should contain the most important information needed to understand the change itself.**

### How Do I Know It Works?

The next thing I want to make easier for the reviewer is verifying my claims.

Simply writing:

```text
Tested locally, works fine.
```

is basically worthless.

The reviewer should know exactly what to check and how to check it.

Depending on the change, I may include:

- manual verification instructions
- automated tests
- screenshots
- logs
- example requests/responses
- benchmark results
- before/after comparisons

If the PR is about query optimization, something like this is useful information:

```text
Before: p95 ~820ms
After: p95 ~190ms
```

If I am fixing a bug, I describe how to reproduce it and how to verify that it no longer happens after the change.

I do not want anyone reading this post to have to memorize all of this because in my opinion that is a waste of both time and brain space.

It is enough to realize why seemingly trivial things like PR size, commit structure, the title, and the PR description matter much more than they may initially seem.

Especially if you are working on a young project that perhaps does not even have a production version yet.

To somehow summarize this chapter, here is my PR description template:

```markdown
# <Short description of the change>

Task: <link>

## Why

Why does this change exist?

## What

What behavior does this PR change?

## How

How was the problem solved?

For non-trivial changes:
- important design decisions
- alternatives considered
- relevant trade-offs

## How to verify

Automated tests:
- ...

Manual verification:
1. ...
2. ...

Expected result:
...

## Evidence

Screenshots/logs/benchmarks/examples where relevant.

## Review focus

Anything I am unsure about or would particularly like feedback on.

## Risks / Breaking changes

- ...
- migration path if needed

## Dependencies / Follow-ups

- ...
```

One important thing:

> **This is not a tax form.**

For small changes, like one-liners, for example, there is absolutely no point, at least in the vast majority of cases, in filling all of this out.

The only thing I would achieve in the long run is making everyone stop reading PR descriptions altogether.

> **The amount of context in a PR description should scale with the complexity and risk of the change.**

A good PR description is not defined by its length.

It should simply be sufficient for the change.

No more, no less.

If I neglect this part and force the reviewer to reconstruct all of that context themselves, deducing it from changed files, the Jira task, and the history of conversations on Slack, then I have just moved part of the work that I should have done as the author onto them.

From this point on, we are already on the other side of the process, the one I described in [the previous article](/blog/on-the-other-side-of-the-pull-request/).
