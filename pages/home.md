---
layout: layouts/home.njk
title: Home
date: 2016-01-01T00:00:00.000Z
permalink: /
navtitle: Home
tags:
  - nav
---
# Testing

{% for vid in videos %}

<iframe width="560" height="315" src="https://www.youtube.com/embed/{{vid.videoId}}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> 

{{vid.description | escape }}

{% endfor %}