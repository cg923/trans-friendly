<h1>Trans Friendly</h1>

<p>Trans Friendly is a web service, much like Yelp, where users can search with the convenience of Google Maps and rate 
businesses of all kinds all over the world.
Instead of rating based on service or value, users rate them based on how "trans-friendly" they are.</p>

<h2>Background</h2>
<p>Over the past two years I have moved clear across the country, twice! In my travels, one of the biggest challenges I encountered
was finding a trans-friendly doctor.  In order to find one, I had to contact the local LGBT center, a luxury of urban life, and even then,
the doctors I was referred to, who claimed to be "gender specialists," often used the wrong pronouns or even the wrong name when talking
to me.  Clearly, "trans-friendly" has a low bar for entry right now.</p>

<h2>User base</h2>
<p>Instead of relying on businesses to self report whether they are open and inclusive, trans people can sign up and decide for themselves
who is really bringing their "A game" to inclusivity.  Users will be able to sign up and rate businesses on a scale of 1 to 5 stars.
These ratings will pop up right inside Google Maps.  Additionally, more descriptive reviews will appear below the map to give
users more information, such as "They have gender-neutral bathrooms!" or "the owner called me a queer!"</p>

<h2>Technology</h2>
<p>Trans Friendly utilizes the Google Maps, Google Places, and Google Geocoding APIs.  Google Maps allows Trans Friendly to display a searchable,
scalable, movable map for users to manipulate.  The map will be populated by Google Places, and expanded upon by our own database
(currently a Mongo database).  Users will sign up and be authenticated, and have the ability to create, edit, and delete reviews.
In order that anyone may use the site, there will, of course, be no requirement that a user be trans to participate, but in the future all reviews
will be submitted through a review cycle and be approved as long as they are clearly well-intentioneod for the trans community.</p>

<h2>Wire-frames and mockups</h2>
<img src="/public/img/mockup.png"><img src="/public/img/mockup2.png">

<h2>Development</h2>
The biggest challenge of building Trans Friendly was giving users an effective and easy-to-use method of interacting with the data in our database.  While adding reviews was a relatively simple first step, allowing users to edit their reviews and then to have the page update accordingly was quite difficult.

First, I had to be able to identify what reviews a user had written, as my Place model, not User, keeps track of reviews, so there is no intrinsic link between them in our database.  Once I had determined what reviews a user should be able to modify, I had to transfer that information into a form the user could edit.  Lastly, when the user submits the form, both the database and the User's view needed to be updated.  While the database piece was working quite quickly, edited reviews were suddenly appearing for the wrong locations, or often not at all.

It turned out that a click listener I had added to create Google's "Info Windows" (those little cartoon-like speech bubbles) was forever relying upon its initial search data and making several incorrect assumptions about the order of results that were actually subject to change with every search.

Once it became clear that I needed to destroy and recreate each info window with new information on each click of a Google "Marker," things began to sort themselves out.
