var exercise_json = []
var timer = new easytimer.Timer()

function reset_timer_label(label, time)
{
    label.innerHTML = "00:" + String(time.minutes).padStart(2, '0') + ":" + String(time.seconds).padStart(2, '0')
}

function exercise_id(day, ex) {
    return 'uebung_' + day + '-' + ex
}

function timer_start(day, id)
{
    // TODO pair names and times

    if (timer.isRunning())
        return

    var uebung = exercise_json[day][0][id]

    let sets_label = document.getElementById(exercise_id(day, id)).getElementsByClassName("sets")[0]
    if (sets_label.innerHTML > 0)
        sets_label.innerHTML = sets_label.innerHTML - 1

    timer.start({countdown: true, startValues: uebung.time})

    let timer_label = document.getElementById(exercise_id(day, id)).getElementsByClassName("timer")[0]

    timer_label.innerHTML = timer.getTimeValues().toString()

    timer.addEventListener('secondsUpdated', function (e) {
        timer_label.innerHTML = timer.getTimeValues().toString()
    });

    timer.addEventListener('targetAchieved', function (e) {
        timer_notify()
        reset_timer_label(timer_label, uebung.time)
    });
}

function timer_notify() {
    Push.create('Pause vorbei', {
        timeout: 4000,
        vibrate: [200, 100, 200, 100, 200, 100, 200]
    });
}

function parse_day(parent, uebungen, supersets, nday) {
    var div = document.createElement("div");
    div.setAttribute("class", "uebungen");
    for (i = 0; i < uebungen.length; i++) {
        let element = uebungen[i]

        let child = document.createElement("div")

        let label_name = document.createElement("label")
        label_name.setAttribute('class', 'name')
        label_name.innerHTML = element.name

        child.setAttribute('class', 'uebung')
        child.setAttribute('id', exercise_id(nday, i))

        let button = document.createElement("button")
        button.setAttribute('onclick', 'timer_start(' + nday + ',' + i + ')')
        button.innerHTML = "Timer"

        let label_timer = document.createElement("label")
        label_timer.setAttribute('class', 'timer')
        reset_timer_label(label_timer, element.time)

        let label_sets = document.createElement("label")
        label_sets.setAttribute('class', 'sets')
        label_sets.innerHTML = element.sets

        let label_reps = document.createElement("label")
        label_reps.setAttribute('class', 'reps')
        label_reps.innerHTML = 'x' + element.reps

        child.appendChild(label_name)
        child.appendChild(button)
        child.appendChild(label_timer)
        child.appendChild(label_reps)
        child.appendChild(label_sets)

        div.appendChild(child)
    }

    parent.appendChild(div)

    // group exercises into 'superset' class divs
    supersets.forEach((e) => {
        let superset = document.createElement("div")
        superset.setAttribute('class', 'superset')

        let before = undefined

        // get the next exercise after the last exercise
        // in the superset, to insert superset before
        let following_id = e[e.length - 1] + 1
        if (following_id < uebungen.length) {
            before = document.getElementById(exercise_id(nday, following_id))
        }

        for (i = 0; i < e.length; i++) {
            superset.appendChild(div.removeChild(document.getElementById(exercise_id(nday, e[i]))))
        }

        if (typeof before != "undefined")
            div.insertBefore(superset, before)
        else
            div.appendChild(superset)
    })
}

window.onload = () => {
    document.getElementById("input").addEventListener("change", (e) => {
        if (e.target.files[0]) {
            var file = e.target.files[0];

            var reader = new FileReader();
            reader.readAsText(file, 'UTF-8');

            reader.onload = (reader_event) => {
                var content = reader_event.target.result;

                var plan = JSON.parse(content)
                exercise_json = plan

                var div = document.getElementById("tage")

                while(div.firstChild)
                    div.remove(div.firstChild)

                var nday = 0;
                plan.forEach((day) => {
                    parse_day(div, day[0], day[1], nday++)
                })
            }
        }
    })
}